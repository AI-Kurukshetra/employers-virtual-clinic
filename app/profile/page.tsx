"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Profile = {
  email: string;
  role: string;
  patient?: { phoneNumber: string; insuranceProvider?: string | null; insuranceId?: string | null } | null;
  provider?: { specialty: string; bio?: string | null; languages: string[] } | null;
  employerAdmin?: { employer?: { name: string } | null } | null;
};

type ApiEnvelope<T> = { data: T; error: string | null; meta: Record<string, unknown> };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const res = await fetch(url, init);
  return (await res.json()) as ApiEnvelope<T>;
}

function roleLabel(role: string) {
  if (role === "PATIENT") return "Patient";
  if (role === "PROVIDER") return "Provider";
  if (role === "EMPLOYER_ADMIN") return "Employer Admin";
  if (role === "SUPER_ADMIN") return "Super Admin";
  return role;
}

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    phoneNumber: "",
    insuranceProvider: "",
    insuranceId: "",
    specialty: "",
    bio: "",
    languages: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      setEditMode(search.get("edit") === "true");
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const json = await fetchJson<Profile>("/api/profile", { cache: "no-store" });
      if (!mounted) return;
      if (json.error || !json.data) {
        setError(json.error ?? "Failed to load profile");
        setLoading(false);
        return;
      }
      setProfile(json.data);
      setForm({
        phoneNumber: json.data.patient?.phoneNumber ?? "",
        insuranceProvider: json.data.patient?.insuranceProvider ?? "",
        insuranceId: json.data.patient?.insuranceId ?? "",
        specialty: json.data.provider?.specialty ?? "",
        bio: json.data.provider?.bio ?? "",
        languages: (json.data.provider?.languages ?? []).join(", "),
      });
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    if (!profile) return;
    setError("");
    setOk("");
    setSaving(true);

    const payload =
      profile.role === "PATIENT"
        ? {
            phoneNumber: form.phoneNumber,
            insuranceProvider: form.insuranceProvider,
            insuranceId: form.insuranceId,
          }
        : profile.role === "PROVIDER"
          ? {
              specialty: form.specialty,
              bio: form.bio,
              languages: form.languages
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            }
          : {};

    const json = await fetchJson("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (json.error) {
      setError(json.error);
      return;
    }

    setOk("Profile updated");
  };

  if (loading) {
    return <main className="mx-auto w-full max-w-3xl p-4 md:p-6">Loading profile...</main>;
  }

  if (!profile) {
    return <main className="mx-auto w-full max-w-3xl p-4 md:p-6 text-destructive">{error || "No profile found"}</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-[150px_1fr] gap-2">
            <span className="text-muted-foreground">Email</span>
            <span>{profile.email}</span>
          </div>
          <div className="grid grid-cols-[150px_1fr] gap-2">
            <span className="text-muted-foreground">Role</span>
            <span>{roleLabel(profile.role)}</span>
          </div>

          {profile.role === "PATIENT" ? (
            <>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Insurance Provider</Label>
                <Input
                  value={form.insuranceProvider}
                  onChange={(e) => setForm((f) => ({ ...f, insuranceProvider: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Insurance ID</Label>
                <Input
                  value={form.insuranceId}
                  onChange={(e) => setForm((f) => ({ ...f, insuranceId: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
            </>
          ) : null}

          {profile.role === "PROVIDER" ? (
            <>
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Languages (comma separated)</Label>
                <Input
                  value={form.languages}
                  onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  disabled={!editMode}
                  rows={4}
                />
              </div>
            </>
          ) : null}

          {profile.role === "EMPLOYER_ADMIN" ? (
            <div className="grid grid-cols-[150px_1fr] gap-2">
              <span className="text-muted-foreground">Employer</span>
              <span>{profile.employerAdmin?.employer?.name ?? "Not linked"}</span>
            </div>
          ) : null}

          {error ? <p className="text-destructive">{error}</p> : null}
          {ok ? <p className="text-teal-700">{ok}</p> : null}

          {editMode ? (
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
