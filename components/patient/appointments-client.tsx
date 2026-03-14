"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { format, startOfDay, endOfDay } from "date-fns";
import { CalendarCheck2, Video, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

type Appointment = {
  id: string;
  type: "VIDEO" | "CHAT" | "AUDIO" | "ASYNC";
  status: string;
  scheduledAt: string;
  provider: { specialty?: string; user?: { email?: string } };
};

type Provider = {
  id: string;
  specialty: string;
  languages: string[];
  bio?: string | null;
  rating: number;
  acceptingPatients: boolean;
  user?: { email?: string };
};

type ProviderAvailabilityResponse = {
  providerId: string;
  availableSlots: string[];
  fromDate: string;
  toDate: string;
};

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

async function postToApi<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || json.error) throw new Error(json.error ?? "Request failed");
  return json.data;
}

function providerName(email?: string) {
  const base = (email ?? "provider@maven.health").split("@")[0];
  return base.replace(/[._-]/g, " ");
}

function PaymentCardBlock() {
  return (
    <div className="rounded-lg border bg-white p-3">
      <p className="mb-2 text-xs text-muted-foreground">Card information</p>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "15px",
              color: "#0f172a",
              "::placeholder": { color: "#94a3b8" },
            },
            invalid: {
              color: "#dc2626",
            },
          },
        }}
      />
    </div>
  );
}

function BookingSheetContent({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();

  const [specialty, setSpecialty] = useState("OBGYN");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [appointmentType, setAppointmentType] = useState<"VIDEO" | "CHAT">("VIDEO");
  const [uiError, setUiError] = useState<string | null>(null);

  const providersQuery = useQuery({
    queryKey: ["providers", specialty],
    queryFn: () => fetchFromApi<Provider[]>(`/api/providers?specialty=${encodeURIComponent(specialty)}&acceptingPatients=true`),
  });

  const availabilityQuery = useQuery({
    queryKey: ["provider-availability", selectedProviderId, selectedDate.toISOString()],
    enabled: Boolean(selectedProviderId),
    queryFn: () => {
      const from = startOfDay(selectedDate).toISOString();
      const to = endOfDay(selectedDate).toISOString();
      return fetchFromApi<ProviderAvailabilityResponse>(
        `/api/providers/${selectedProviderId}/availability?fromDate=${encodeURIComponent(from)}&toDate=${encodeURIComponent(to)}`,
      );
    },
  });

  const createAppointment = useMutation({
    mutationFn: async () => {
      if (!selectedProviderId || !selectedSlot || !chiefComplaint.trim()) {
        throw new Error("Select provider, time slot, and add chief complaint");
      }

      const appointment = await postToApi<{ id: string }>("/api/appointments", {
        providerId: selectedProviderId,
        type: appointmentType,
        scheduledAt: selectedSlot,
        duration: 30,
        chiefComplaint,
      });

      const selectedProvider = (providersQuery.data ?? []).find((p) => p.id === selectedProviderId);

      const checkout = await postToApi<{ clientSecret: string | null; paymentIntentId: string }>("/api/payments/checkout", {
        appointmentId: appointment.id,
        appointmentType,
        specialty: selectedProvider?.specialty ?? specialty,
        currency: "usd",
      });

      if (checkout.clientSecret && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        if (cardElement) {
          const paymentResult = await stripe.confirmCardPayment(checkout.clientSecret, {
            payment_method: { card: cardElement },
          });

          if (paymentResult.error) {
            throw new Error(paymentResult.error.message ?? "Card payment failed");
          }
        }
      }

      return appointment;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onDone();
    },
  });

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">1. Pick specialty</p>
        <Select value={specialty} onValueChange={(value) => setSpecialty(value ?? "OBGYN")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OBGYN">OBGYN</SelectItem>
            <SelectItem value="THERAPY">Therapy</SelectItem>
            <SelectItem value="PRIMARY_CARE">Primary Care</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">2. Choose provider</p>
        {providersQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (providersQuery.data ?? []).length ? (
          <div className="space-y-2">
            {(providersQuery.data ?? []).map((provider) => (
              <button
                key={provider.id}
                className={`w-full rounded-lg border p-3 text-left ${
                  selectedProviderId === provider.id ? "border-teal-500 bg-teal-50" : "bg-white"
                }`}
                onClick={() => {
                  setSelectedProviderId(provider.id);
                  setSelectedSlot("");
                }}
                type="button"
              >
                <p className="font-medium">Dr. {providerName(provider.user?.email)}</p>
                <p className="text-xs text-muted-foreground">{provider.specialty} • ⭐ {provider.rating.toFixed(1)}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">👩‍⚕️ No providers found.</div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">3. Select date and time</p>
        <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} className="rounded-lg border bg-white" />

        <div className="grid grid-cols-2 gap-2">
          {availabilityQuery.isLoading ? (
            <Skeleton className="col-span-2 h-10" />
          ) : (availabilityQuery.data?.availableSlots ?? []).length ? (
            availabilityQuery.data?.availableSlots.map((slot) => (
              <Button
                key={slot}
                type="button"
                variant={selectedSlot === slot ? "default" : "outline"}
                className={selectedSlot === slot ? "bg-teal-600 text-white hover:bg-teal-500" : ""}
                onClick={() => setSelectedSlot(slot)}
              >
                {format(new Date(slot), "h:mm a")}
              </Button>
            ))
          ) : (
            <div className="col-span-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">No slots available</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">4. Visit details</p>
        <Select value={appointmentType} onValueChange={(v) => setAppointmentType(v as "VIDEO" | "CHAT")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Appointment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VIDEO">Video</SelectItem>
            <SelectItem value="CHAT">Chat</SelectItem>
          </SelectContent>
        </Select>
        <Textarea
          rows={3}
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Describe your symptoms or concern"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">5. Payment</p>
        {stripePromise ? <PaymentCardBlock /> : <p className="text-xs text-muted-foreground">Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to enable card entry.</p>}
      </div>

      {uiError ? <p className="text-sm text-destructive">{uiError}</p> : null}

      <Button
        className="w-full bg-teal-600 text-white hover:bg-teal-500"
        disabled={createAppointment.isPending}
        onClick={() => {
          setUiError(null);
          createAppointment.mutate(undefined, {
            onError: (error) => setUiError(error instanceof Error ? error.message : "Unable to complete booking"),
          });
        }}
      >
        {createAppointment.isPending ? "Confirming..." : "Confirm booking"}
      </Button>
    </div>
  );
}

export function PatientAppointmentsClient() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "patient"],
    queryFn: () => fetchFromApi<Appointment[]>("/api/appointments"),
  });

  const dayAppointments = useMemo(
    () =>
      (appointmentsQuery.data ?? []).filter((appt) => {
        const d = new Date(appt.scheduledAt);
        return d.toDateString() === selectedDate.toDateString();
      }),
    [appointmentsQuery.data, selectedDate],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[340px,1fr]">
      <Card className="bg-white/85">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck2 className="h-4 w-4 text-teal-600" />
            Calendar
          </CardTitle>
          <CardDescription>Select a date to view appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} className="rounded-lg border bg-white" />
        </CardContent>
      </Card>

      <Card className="bg-white/85">
        <CardHeader>
          <CardTitle>Appointments on {format(selectedDate, "MMM d, yyyy")}</CardTitle>
          <CardDescription>Your schedule for the selected day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-teal-600 text-white hover:bg-teal-500 sm:w-auto" onClick={() => setIsSheetOpen(true)}>
            Book New Appointment
          </Button>

          {appointmentsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : dayAppointments.length ? (
            dayAppointments.map((appt) => (
              <div key={appt.id} className="rounded-lg border bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Dr. {providerName(appt.provider.user?.email)}</p>
                  <Badge variant="outline">{appt.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{appt.provider.specialty ?? "General care"}</p>
                <p className="mt-1 text-sm">{format(new Date(appt.scheduledAt), "h:mm a")}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-600">
                  {appt.type === "VIDEO" ? <Video className="h-3.5 w-3.5" /> : <MessageSquareText className="h-3.5 w-3.5" />}
                  {appt.type}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              <p className="text-2xl">🗓️</p>
              <p>No appointments on this date.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-[560px] overflow-y-auto p-0" side="right">
          <SheetHeader className="border-b bg-rose-50/60">
            <SheetTitle>Book Appointment</SheetTitle>
            <SheetDescription>Select provider, slot, and complete payment.</SheetDescription>
          </SheetHeader>

          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <BookingSheetContent onDone={() => setIsSheetOpen(false)} />
            </Elements>
          ) : (
            <BookingSheetContent onDone={() => setIsSheetOpen(false)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
