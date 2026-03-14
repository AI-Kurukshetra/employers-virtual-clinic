"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Video, { LocalTrackPublication, RemoteParticipant, RemoteTrackPublication, Room, Track } from "twilio-video";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, CameraOff, Mic, MicOff, MonitorUp, PhoneOff, MessageSquare, FlaskConical, FilePlus2, ClipboardPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type Appointment = {
  id: string;
  notes?: string | null;
  chiefComplaint?: string | null;
  patientId: string;
  providerId: string;
  patient: {
    dateOfBirth?: string;
    user?: { email?: string };
  };
  provider: {
    user?: { email?: string };
  };
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function getTrackFromPublication(pub: LocalTrackPublication | RemoteTrackPublication): Track | null {
  return pub.track ?? null;
}

function attachTrack(track: Track) {
  const withAttach = track as Track & { attach?: () => HTMLElement };
  return withAttach.attach ? withAttach.attach() : null;
}

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function mutateApi<T>(url: string, method: "POST" | "PATCH", body: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

export function ConsultationRoom({ appointmentId, role }: { appointmentId: string; role: "PATIENT" | "PROVIDER" }) {
  const router = useRouter();
  const localContainerRef = useRef<HTMLDivElement | null>(null);
  const remoteContainerRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<Room | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [joining, setJoining] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [localPosition, setLocalPosition] = useState({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [lastSavedNotes, setLastSavedNotes] = useState("");

  const [prescriptionForm, setPrescriptionForm] = useState({ medication: "", dosage: "", frequency: "", refills: "1" });
  const [labForm, setLabForm] = useState({ testName: "", testCode: "", labProvider: "LABCORP" });
  const [referralForm, setReferralForm] = useState({ specialtyNeeded: "", urgency: "ROUTINE", notes: "" });

  const appointmentQuery = useQuery({
    queryKey: ["consultation-appointment", appointmentId],
    queryFn: () => fetchFromApi<Appointment>(`/api/appointments/${appointmentId}`),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLocalPosition({ x: Math.max(12, window.innerWidth - 280), y: Math.max(12, window.innerHeight - 220) });
  }, []);

  useEffect(() => {
    if (!appointmentQuery.data) return;
    const initial = appointmentQuery.data.notes ?? "";
    setNoteDraft(initial);
    setLastSavedNotes(initial);
  }, [appointmentQuery.data]);

  const { mutate: joinRoomMutate } = useMutation({
    mutationFn: async () => {
      const tokenRes = await mutateApi<{ token: string; roomName: string }>("/api/consultations/token", "POST", { appointmentId });
      const room = await Video.connect(tokenRes.token, {
        name: tokenRes.roomName,
        audio: true,
        video: { width: 640 },
      });
      return room;
    },
    onSuccess: (room) => {
      roomRef.current = room;
      setConnected(true);
      setJoining(false);
      setRemoteParticipants(Array.from(room.participants.values()));

      room.localParticipant.videoTracks.forEach((pub) => {
        const track = getTrackFromPublication(pub);
        if (track && track.kind === "video" && localContainerRef.current) {
          localContainerRef.current.innerHTML = "";
          const node = attachTrack(track);
          if (node) localContainerRef.current.appendChild(node);
        }
      });

      room.on("participantConnected", (participant) => {
        setRemoteParticipants((prev) => [...prev, participant]);
      });

      room.on("participantDisconnected", (participant) => {
        setRemoteParticipants((prev) => prev.filter((p) => p.sid !== participant.sid));
      });

      const startedAt = Date.now();
      const interval = setInterval(() => {
        setCallSeconds(Math.floor((Date.now() - startedAt) / 1000));
      }, 1000);

      room.on("disconnected", () => {
        clearInterval(interval);
      });
    },
    onError: () => {
      setJoining(false);
    },
  });

  useEffect(() => {
    joinRoomMutate();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [joinRoomMutate]);

  useEffect(() => {
    if (!remoteContainerRef.current) return;

    const container = remoteContainerRef.current;
    container.innerHTML = "";

    for (const participant of remoteParticipants) {
      participant.videoTracks.forEach((pub) => {
        const track = getTrackFromPublication(pub);
        if (track && track.kind === "video") {
          const node = attachTrack(track);
          if (node) container.appendChild(node);
        }
      });
    }

    const unsubscribeFns = remoteParticipants.map((participant) => {
      const onSubscribed = (track: Track) => {
        if (track.kind === "video" && remoteContainerRef.current) {
          const node = attachTrack(track);
          if (node) remoteContainerRef.current.appendChild(node);
        }
      };
      participant.on("trackSubscribed", onSubscribed);
      return () => participant.off("trackSubscribed", onSubscribed);
    });

    return () => {
      unsubscribeFns.forEach((fn) => fn());
      container.querySelectorAll("video").forEach((el) => el.remove());
    };
  }, [remoteParticipants]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: MouseEvent) => {
      setLocalPosition({ x: event.clientX - 80, y: event.clientY - 50 });
    };

    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const toggleMic = () => {
    const room = roomRef.current;
    if (!room) return;

    room.localParticipant.audioTracks.forEach((pub) => {
      pub.track.enable(!isMicOn);
    });
    setIsMicOn((prev) => !prev);
  };

  const toggleCamera = () => {
    const room = roomRef.current;
    if (!room) return;

    room.localParticipant.videoTracks.forEach((pub) => {
      pub.track.enable(!isCamOn);
    });
    setIsCamOn((prev) => !prev);
  };

  const toggleScreenShare = async () => {
    const room = roomRef.current;
    if (!room) return;

    if (!isScreenSharing) {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = new Video.LocalVideoTrack(stream.getVideoTracks()[0]);
      await room.localParticipant.publishTrack(screenTrack);
      screenTrack.mediaStreamTrack.addEventListener("ended", async () => {
        await room.localParticipant.unpublishTrack(screenTrack);
        screenTrack.stop();
        setIsScreenSharing(false);
      });
      setIsScreenSharing(true);
      return;
    }

    room.localParticipant.videoTracks.forEach((pub) => {
      if (pub.track.name.includes("screen")) {
        room.localParticipant.unpublishTrack(pub.track);
        pub.track.stop();
      }
    });
    setIsScreenSharing(false);
  };

  const endCall = async () => {
    try {
      await mutateApi(`/api/appointments/${appointmentId}`, "POST", { status: "COMPLETED" });
    } catch {
      // no-op
    }

    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    router.push(role === "PATIENT" ? "/patient/dashboard" : "/provider/dashboard");
    router.refresh();
  };

  const saveNotesMutation = useMutation({
    mutationFn: () => mutateApi(`/api/appointments/${appointmentId}`, "PATCH", { notes: noteDraft }),
    onSuccess: () => {
      setLastSavedNotes(noteDraft);
    },
  });

  useEffect(() => {
    if (role !== "PROVIDER") return;

    const interval = setInterval(() => {
      if (noteDraft !== lastSavedNotes && !saveNotesMutation.isPending) {
        saveNotesMutation.mutate();
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [role, noteDraft, lastSavedNotes, saveNotesMutation]);

  const createPrescription = useMutation({
    mutationFn: () =>
      mutateApi("/api/prescriptions", "POST", {
        patientId: appointmentQuery.data?.patientId,
        appointmentId,
        medication: prescriptionForm.medication,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        refills: Number(prescriptionForm.refills),
        startDate: new Date().toISOString(),
      }),
  });

  const orderLab = useMutation({
    mutationFn: () =>
      mutateApi("/api/labs", "POST", {
        patientId: appointmentQuery.data?.patientId,
        appointmentId,
        testName: labForm.testName,
        testCode: labForm.testCode,
        labProvider: labForm.labProvider,
      }),
  });

  const createReferral = useMutation({
    mutationFn: () =>
      mutateApi("/api/referrals", "POST", {
        patientId: appointmentQuery.data?.patientId,
        specialtyNeeded: referralForm.specialtyNeeded,
        urgency: referralForm.urgency,
        notes: referralForm.notes,
      }),
  });

  const patientName = useMemo(() => {
    const email = appointmentQuery.data?.patient.user?.email;
    if (!email) return "Patient";
    return email.split("@")[0].replace(/[._-]/g, " ");
  }, [appointmentQuery.data?.patient.user?.email]);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div ref={remoteContainerRef} className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
        {!joining && connected && remoteParticipants.length === 0 ? (
          <div className="absolute inset-0 grid place-content-center bg-slate-950/65">
            <p className="text-lg font-medium">Waiting for provider...</p>
            <p className="text-sm text-slate-300">The consultation will begin when both participants join.</p>
          </div>
        ) : null}
        {joining ? (
          <div className="absolute inset-0 grid place-content-center bg-slate-950/70">
            <p className="text-lg font-medium">Joining consultation...</p>
          </div>
        ) : null}
      </div>

      <div
        className="absolute z-20 h-36 w-56 cursor-move overflow-hidden rounded-xl border border-white/20 bg-slate-900/70 shadow-lg"
        style={{ left: localPosition.x, top: localPosition.y }}
        onMouseDown={() => setDragging(true)}
      >
        <div ref={localContainerRef} className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />
      </div>

      <div className="absolute top-4 left-4 z-30 rounded-full bg-black/40 px-3 py-1 text-sm">Call {formatDuration(callSeconds)}</div>

      {role === "PROVIDER" ? (
        <aside className="absolute top-0 right-0 z-30 h-full w-full max-w-sm overflow-y-auto border-l border-white/10 bg-slate-900/90 p-4">
          <h2 className="text-lg font-semibold">Clinical Sidebar</h2>
          <Card className="mt-3 border-white/10 bg-slate-800/60 p-3 text-white">
            <p className="font-medium">{patientName}</p>
            <p className="text-xs text-slate-300">DOB: {appointmentQuery.data?.patient.dateOfBirth ? format(new Date(appointmentQuery.data.patient.dateOfBirth), "MMM d, yyyy") : "N/A"}</p>
            <p className="mt-2 text-sm text-slate-200">Chief complaint: {appointmentQuery.data?.chiefComplaint ?? "Not provided"}</p>
          </Card>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Quick Notes</p>
            <Textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              className="min-h-36 border-white/20 bg-slate-800 text-white"
            />
            <p className="text-xs text-slate-300">Auto-saves every 30 seconds</p>
          </div>

          <div className="mt-4 space-y-2">
            <Dialog>
              <DialogTrigger render={<Button className="w-full bg-teal-600 text-white hover:bg-teal-500" />}>
                <ClipboardPlus className="mr-2 h-4 w-4" />
                Write Prescription
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write Prescription</DialogTitle>
                  <DialogDescription>Create prescription for this consultation</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Input placeholder="Medication" value={prescriptionForm.medication} onChange={(e) => setPrescriptionForm((p) => ({ ...p, medication: e.target.value }))} />
                  <Input placeholder="Dosage" value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm((p) => ({ ...p, dosage: e.target.value }))} />
                  <Input placeholder="Frequency" value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm((p) => ({ ...p, frequency: e.target.value }))} />
                  <Input placeholder="Refills" type="number" value={prescriptionForm.refills} onChange={(e) => setPrescriptionForm((p) => ({ ...p, refills: e.target.value }))} />
                  <Button className="w-full" onClick={() => createPrescription.mutate()}>Save Prescription</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger render={<Button variant="outline" className="w-full" />}>
                <FlaskConical className="mr-2 h-4 w-4" />
                Order Lab
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Order Lab</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Input placeholder="Test Name" value={labForm.testName} onChange={(e) => setLabForm((p) => ({ ...p, testName: e.target.value }))} />
                  <Input placeholder="Test Code" value={labForm.testCode} onChange={(e) => setLabForm((p) => ({ ...p, testCode: e.target.value }))} />
                  <Select value={labForm.labProvider} onValueChange={(value) => setLabForm((p) => ({ ...p, labProvider: value ?? "LABCORP" }))}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Lab provider" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LABCORP">LabCorp</SelectItem>
                      <SelectItem value="QUEST">Quest</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={() => orderLab.mutate()}>Submit Lab Order</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger render={<Button variant="outline" className="w-full" />}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Create Referral
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Referral</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Input placeholder="Specialty Needed" value={referralForm.specialtyNeeded} onChange={(e) => setReferralForm((p) => ({ ...p, specialtyNeeded: e.target.value }))} />
                  <Select value={referralForm.urgency} onValueChange={(value) => setReferralForm((p) => ({ ...p, urgency: value ?? "ROUTINE" }))}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Urgency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUTINE">Routine</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="EMERGENT">Emergent</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Notes" value={referralForm.notes} onChange={(e) => setReferralForm((p) => ({ ...p, notes: e.target.value }))} />
                  <Button className="w-full" onClick={() => createReferral.mutate()}>Create Referral</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </aside>
      ) : null}

      {isChatOpen ? (
        <aside className="absolute top-0 right-0 z-30 h-full w-full max-w-xs border-l border-white/10 bg-slate-900/90 p-4">
          <h3 className="font-medium">Consultation Chat</h3>
          <p className="mt-2 text-sm text-slate-300">Use secure messaging from the Messages tab for full history and read receipts.</p>
        </aside>
      ) : null}

      <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/45 p-2 backdrop-blur">
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-black/50" onClick={toggleMic}>
          {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-black/50" onClick={toggleCamera}>
          {isCamOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </Button>
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-black/50" onClick={toggleScreenShare}>
          <MonitorUp className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="border-white/20 bg-black/30 text-white hover:bg-black/50" onClick={() => setIsChatOpen((v) => !v)}>
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button className="bg-red-600 text-white hover:bg-red-500" onClick={endCall}>
          <PhoneOff className="mr-2 h-4 w-4" />
          End
        </Button>
      </div>
    </main>
  );
}
