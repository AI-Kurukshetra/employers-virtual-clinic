"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const registrationSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    role: z.enum(["PATIENT", "PROVIDER"]),
    dateOfBirth: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insuranceId: z.string().optional(),
    specialty: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseState: z.string().optional(),
    npiNumber: z.string().optional(),
    languages: z.array(z.string()).optional(),
    bio: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({ code: "custom", message: "Passwords do not match", path: ["confirmPassword"] });
    }

    if (val.role === "PATIENT") {
      if (!val.dateOfBirth) ctx.addIssue({ code: "custom", message: "Date of birth is required", path: ["dateOfBirth"] });
      if (!val.phoneNumber) ctx.addIssue({ code: "custom", message: "Phone number is required", path: ["phoneNumber"] });
      if (!val.address) ctx.addIssue({ code: "custom", message: "Address is required", path: ["address"] });
    }

    if (val.role === "PROVIDER") {
      if (!val.specialty) ctx.addIssue({ code: "custom", message: "Specialty is required", path: ["specialty"] });
      if (!val.licenseNumber) ctx.addIssue({ code: "custom", message: "License number is required", path: ["licenseNumber"] });
      if (!val.licenseState) ctx.addIssue({ code: "custom", message: "License state is required", path: ["licenseState"] });
      if (!val.npiNumber) ctx.addIssue({ code: "custom", message: "NPI is required", path: ["npiNumber"] });
      if (!(val.languages ?? []).length) ctx.addIssue({ code: "custom", message: "Pick at least one language", path: ["languages"] });
    }
  });

type RegistrationValues = z.infer<typeof registrationSchema>;

const specialties = ["OBGYN", "THERAPY", "PRIMARY_CARE", "ENDOCRINOLOGY", "NUTRITION"];
const languageChoices = ["English", "Spanish", "Hindi", "French", "Mandarin"];

export function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PATIENT",
      dateOfBirth: "",
      phoneNumber: "",
      address: "",
      insuranceProvider: "",
      insuranceId: "",
      specialty: "",
      licenseNumber: "",
      licenseState: "",
      npiNumber: "",
      languages: [],
      bio: "",
    },
    mode: "onTouched",
  });

  const role = watch("role");
  const values = watch();

  const progress = useMemo(() => (step / 3) * 100, [step]);

  const goNext = async () => {
    const fieldsForStep1: Array<keyof RegistrationValues> = ["name", "email", "password", "confirmPassword", "role"];
    const fieldsForStep2Patient: Array<keyof RegistrationValues> = ["dateOfBirth", "phoneNumber", "address", "insuranceProvider", "insuranceId"];
    const fieldsForStep2Provider: Array<keyof RegistrationValues> = ["specialty", "licenseNumber", "licenseState", "npiNumber", "languages", "bio"];

    const valid =
      step === 1
        ? await trigger(fieldsForStep1)
        : await trigger(role === "PATIENT" ? fieldsForStep2Patient : fieldsForStep2Provider);

    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null);

    const payload =
      data.role === "PATIENT"
        ? {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            patientDetails: {
              dateOfBirth: data.dateOfBirth,
              phoneNumber: data.phoneNumber,
              address: data.address,
              insuranceProvider: data.insuranceProvider,
              insuranceId: data.insuranceId,
            },
          }
        : {
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            providerDetails: {
              specialty: data.specialty,
              licenseNumber: data.licenseNumber,
              licenseState: data.licenseState,
              npiNumber: data.npiNumber,
              languages: data.languages,
              bio: data.bio,
            },
          };

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as { error?: string | null };

    if (!res.ok) {
      setSubmitError(json.error ?? "Unable to register. Please try again.");
      return;
    }

    router.push("/login");
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#fff7f9_0%,#eefbf8_55%,#eaf9fb_100%)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create your Maven Health account</h1>
          <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          <div className="mx-auto mt-3 h-2 max-w-sm rounded-full bg-rose-100">
            <div className="h-2 rounded-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card className="border-0 bg-white/90 shadow-xl ring-1 ring-rose-100 backdrop-blur">
          <CardHeader>
            <CardTitle>{step === 1 ? "Account" : step === 2 ? "Profile details" : "Review"}</CardTitle>
            <CardDescription>
              {step === 1
                ? "Tell us who you are."
                : step === 2
                  ? "Add details to personalize your care experience."
                  : "Confirm your information before submission."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                  {errors.confirmPassword ? <p className="text-xs text-destructive">{errors.confirmPassword.message}</p> : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Role</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={role === "PATIENT" ? "default" : "outline"}
                      className={role === "PATIENT" ? "bg-teal-600 text-white hover:bg-teal-500" : ""}
                      onClick={() => setValue("role", "PATIENT")}
                    >
                      Patient
                    </Button>
                    <Button
                      type="button"
                      variant={role === "PROVIDER" ? "default" : "outline"}
                      className={role === "PROVIDER" ? "bg-teal-600 text-white hover:bg-teal-500" : ""}
                      onClick={() => setValue("role", "PROVIDER")}
                    >
                      Provider
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 && role === "PATIENT" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input id="dob" type="date" {...register("dateOfBirth")} />
                  {errors.dateOfBirth ? <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phoneNumber")} />
                  {errors.phoneNumber ? <p className="text-xs text-destructive">{errors.phoneNumber.message}</p> : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register("address")} />
                  {errors.address ? <p className="text-xs text-destructive">{errors.address.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Insurance provider</Label>
                  <Input id="insuranceProvider" {...register("insuranceProvider")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceId">Member ID</Label>
                  <Input id="insuranceId" {...register("insuranceId")} />
                </div>
              </div>
            ) : null}

            {step === 2 && role === "PROVIDER" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Specialty</Label>
                  <Select value={values.specialty} onValueChange={(v) => setValue("specialty", v ?? "")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialty ? <p className="text-xs text-destructive">{errors.specialty.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License number</Label>
                  <Input id="licenseNumber" {...register("licenseNumber")} />
                  {errors.licenseNumber ? <p className="text-xs text-destructive">{errors.licenseNumber.message}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseState">License state</Label>
                  <Input id="licenseState" {...register("licenseState")} />
                  {errors.licenseState ? <p className="text-xs text-destructive">{errors.licenseState.message}</p> : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="npiNumber">NPI number</Label>
                  <Input id="npiNumber" {...register("npiNumber")} />
                  {errors.npiNumber ? <p className="text-xs text-destructive">{errors.npiNumber.message}</p> : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Languages spoken</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {languageChoices.map((language) => {
                      const checked = (values.languages ?? []).includes(language);
                      return (
                        <label key={language} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(isChecked) => {
                              const next = isChecked
                                ? [...(values.languages ?? []), language]
                                : (values.languages ?? []).filter((l) => l !== language);
                              setValue("languages", next, { shouldValidate: true });
                            }}
                          />
                          {language}
                        </label>
                      );
                    })}
                  </div>
                  {errors.languages ? <p className="text-xs text-destructive">{errors.languages.message}</p> : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" rows={4} {...register("bio")} />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4 rounded-xl border bg-rose-50/45 p-4">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <p><span className="font-medium">Name:</span> {values.name}</p>
                  <p><span className="font-medium">Email:</span> {values.email}</p>
                  <p><span className="font-medium">Role:</span> {values.role}</p>
                  {role === "PATIENT" ? <p><span className="font-medium">DOB:</span> {values.dateOfBirth}</p> : null}
                  {role === "PROVIDER" ? <p><span className="font-medium">Specialty:</span> {values.specialty}</p> : null}
                </div>
                {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || isSubmitting}>
                Back
              </Button>

              {step < 3 ? (
                <Button type="button" className="bg-teal-600 text-white hover:bg-teal-500" onClick={goNext}>
                  Continue
                </Button>
              ) : (
                <Button className="bg-teal-600 text-white hover:bg-teal-500" onClick={onSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Create account"}
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="font-medium text-teal-700 underline-offset-4 hover:underline" href="/login">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
