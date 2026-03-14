const {
  PrismaClient,
  Role,
  AppointmentType,
  AppointmentStatus,
  CycleFlow,
  PrescriptionStatus,
  LabStatus,
  LabProvider,
  CarePlanStatus,
  ReferralUrgency,
  ReferralStatus,
  AssessmentType,
  ClaimStatus,
} = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function upsertUser(email, role, passwordHash) {
  return prisma.user.upsert({
    where: { email },
    update: { role, password: passwordHash },
    create: { email, role, password: passwordHash },
  });
}

function pick(list, index) {
  return list[index % list.length];
}

function nameFromEmail(email) {
  return email.split("@")[0].replace(/[._-]/g, " ");
}

async function seedProviders(passwordHash) {
  const providerDefs = [
    {
      email: "sarah.chen@virtualclinic.com",
      specialty: "OB/GYN",
      licenseNumber: "WA-OB-11021",
      licenseState: "WA",
      npiNumber: "1225533331",
      languages: ["English", "Mandarin"],
      rating: 4.9,
      bio: "Specializes in PCOS, fertility, and menstrual health care.",
    },
    {
      email: "maya.patel@virtualclinic.com",
      specialty: "Endocrinologist",
      licenseNumber: "WA-ENDO-22011",
      licenseState: "WA",
      npiNumber: "1886622219",
      languages: ["English", "Hindi"],
      rating: 4.8,
      bio: "Hormonal and metabolic health expert focused on long-term outcomes.",
    },
    {
      email: "lisa.torres@virtualclinic.com",
      specialty: "Mental Health",
      licenseNumber: "WA-MH-33010",
      licenseState: "WA",
      npiNumber: "1997733312",
      languages: ["English", "Spanish"],
      rating: 4.95,
      bio: "Perinatal and anxiety-focused behavioral care with integrated plans.",
    },
  ];

  const providers = [];

  for (const def of providerDefs) {
    const user = await upsertUser(def.email, Role.PROVIDER, passwordHash);
    const provider = await prisma.provider.upsert({
      where: { userId: user.id },
      update: {
        specialty: def.specialty,
        licenseNumber: def.licenseNumber,
        licenseState: def.licenseState,
        npiNumber: def.npiNumber,
        languages: def.languages,
        bio: def.bio,
        rating: def.rating,
        totalReviews: 120,
        acceptingPatients: true,
        availability: {
          monday: [{ start: "09:00", end: "17:00", slotDuration: 30 }],
          tuesday: [{ start: "09:00", end: "17:00", slotDuration: 30 }],
          wednesday: [{ start: "09:00", end: "17:00", slotDuration: 30 }],
          thursday: [{ start: "10:00", end: "18:00", slotDuration: 30 }],
          friday: [{ start: "09:00", end: "14:00", slotDuration: 30 }],
          saturday: [],
          sunday: [],
          blockedDates: [],
        },
      },
      create: {
        userId: user.id,
        specialty: def.specialty,
        licenseNumber: def.licenseNumber,
        licenseState: def.licenseState,
        npiNumber: def.npiNumber,
        languages: def.languages,
        bio: def.bio,
        rating: def.rating,
        totalReviews: 120,
        acceptingPatients: true,
        availability: {
          monday: [{ start: "09:00", end: "17:00", slotDuration: 30 }],
          tuesday: [{ start: "09:00", end: "17:00", slotDuration: 30 }],
          wednesday: [{ start: "09:00", end: "17:00", slotDuration: 30 }],
          thursday: [{ start: "10:00", end: "18:00", slotDuration: 30 }],
          friday: [{ start: "09:00", end: "14:00", slotDuration: 30 }],
          saturday: [],
          sunday: [],
          blockedDates: [],
        },
      },
    });

    providers.push({ user, provider });
  }

  return providers;
}

async function seedPatients(passwordHash) {
  const patientDefs = [
    {
      email: "emma.johnson@gmail.com",
      dateOfBirth: "1994-04-11",
      phoneNumber: "+1-206-555-0111",
      insuranceProvider: "BlueCross",
      insuranceId: "BC-EMMA-1001",
      condition: "PCOS",
      allergies: ["Penicillin"],
      medications: ["Metformin"],
    },
    {
      email: "sophia.w@gmail.com",
      dateOfBirth: "1998-07-02",
      phoneNumber: "+1-206-555-0112",
      insuranceProvider: "Aetna",
      insuranceId: "AE-SOPHIA-2001",
      condition: "Fertility tracking",
      allergies: [],
      medications: ["Prenatal vitamin"],
    },
    {
      email: "olivia.m@gmail.com",
      dateOfBirth: "1991-09-19",
      phoneNumber: "+1-206-555-0113",
      insuranceProvider: "United",
      insuranceId: "UN-OLIVIA-3001",
      condition: "Endometriosis",
      allergies: ["Latex"],
      medications: ["Ibuprofen"],
    },
    {
      email: "ava.t@gmail.com",
      dateOfBirth: "1996-12-22",
      phoneNumber: "+1-206-555-0114",
      insuranceProvider: "Cigna",
      insuranceId: "CI-AVA-4001",
      condition: "Anxiety + Hormonal",
      allergies: [],
      medications: ["Sertraline"],
    },
  ];

  const patients = [];

  for (const def of patientDefs) {
    const user = await upsertUser(def.email, Role.PATIENT, passwordHash);
    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {
        dateOfBirth: new Date(def.dateOfBirth),
        phoneNumber: def.phoneNumber,
        insuranceProvider: def.insuranceProvider,
        insuranceId: def.insuranceId,
        address: { line1: "100 Demo St", city: "Seattle", state: "WA", zip: "98101" },
        emergencyContact: { name: "Emergency Contact", phone: "+1-206-555-0199", relation: "Family" },
        medicalHistory: { primaryCondition: def.condition, notes: "Imported demo chart" },
        allergies: def.allergies,
        medications: def.medications,
      },
      create: {
        userId: user.id,
        dateOfBirth: new Date(def.dateOfBirth),
        phoneNumber: def.phoneNumber,
        insuranceProvider: def.insuranceProvider,
        insuranceId: def.insuranceId,
        address: { line1: "100 Demo St", city: "Seattle", state: "WA", zip: "98101" },
        emergencyContact: { name: "Emergency Contact", phone: "+1-206-555-0199", relation: "Family" },
        medicalHistory: { primaryCondition: def.condition, notes: "Imported demo chart" },
        allergies: def.allergies,
        medications: def.medications,
      },
    });

    patients.push({ user, patient, condition: def.condition });
  }

  return patients;
}

async function ensureAppointments(patients, providers) {
  const complaints = [
    "Irregular periods for 3 months",
    "Fertility consultation - trying to conceive",
    "Pelvic pain management",
    "Anxiety and mood swings",
    "Follow-up: hormone panel results",
    "Endometriosis flare-up",
    "Birth control discussion",
    "Medication side effect review",
  ];
  const statuses = [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.IN_PROGRESS,
  ];
  const types = [AppointmentType.VIDEO, AppointmentType.CHAT, AppointmentType.AUDIO, AppointmentType.ASYNC];

  for (let i = 0; i < patients.length; i += 1) {
    const patient = patients[i].patient;
    const assignedProvider = providers[i % providers.length].provider;

    const existing = await prisma.appointment.count({ where: { patientId: patient.id } });
    const target = 6;

    for (let n = existing; n < target; n += 1) {
      const offsetDays = n - 3;
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          providerId: assignedProvider.id,
          type: pick(types, n),
          status: pick(statuses, n),
          scheduledAt: new Date(Date.now() + offsetDays * MS_PER_DAY),
          duration: 30,
          chiefComplaint: pick(complaints, n + i),
          notes: n % 2 === 0 ? "Patient progressing with current care plan." : null,
          videoRoomId: `room-${patient.id}-${n + 1}`,
        },
      });
    }
  }
}

async function ensureSymptoms(patients) {
  for (let i = 0; i < patients.length; i += 1) {
    const p = patients[i];
    const existing = await prisma.symptomLog.count({ where: { patientId: p.patient.id } });
    const target = 14;
    for (let d = existing; d < target; d += 1) {
      await prisma.symptomLog.create({
        data: {
          patientId: p.patient.id,
          date: new Date(Date.now() - d * MS_PER_DAY),
          symptoms: { tags: d % 3 === 0 ? ["cramps", "fatigue"] : ["bloating"] },
          mood: 5 + ((d + i) % 4),
          energy: 4 + ((d + i) % 5),
          sleep: 6 + ((d + i) % 3) * 0.5,
          pain: 1 + ((d + i) % 4),
          notes: d % 5 === 0 ? "Mild symptoms today" : null,
        },
      });
    }
  }
}

async function ensureCycles(patients) {
  for (let i = 0; i < patients.length; i += 1) {
    const p = patients[i];
    const existing = await prisma.cycleTrack.count({ where: { patientId: p.patient.id } });
    const target = 6;
    for (let m = existing; m < target; m += 1) {
      const start = new Date(Date.now() - (m + 1) * 30 * MS_PER_DAY);
      const end = new Date(start.getTime() + 5 * MS_PER_DAY);
      await prisma.cycleTrack.create({
        data: {
          patientId: p.patient.id,
          periodStart: start,
          periodEnd: end,
          cycleLength: 27 + ((m + i) % 5),
          ovulationDate: new Date(start.getTime() + 14 * MS_PER_DAY),
          symptoms: ["cramps"],
          flow: m % 3 === 0 ? CycleFlow.HEAVY : CycleFlow.MEDIUM,
          notes: null,
        },
      });
    }
  }
}

async function ensureFertilityData(patients) {
  for (let i = 0; i < patients.length; i += 1) {
    const p = patients[i];
    const existing = await prisma.fertilityData.count({ where: { patientId: p.patient.id } });
    const target = 5;
    for (let n = existing; n < target; n += 1) {
      await prisma.fertilityData.create({
        data: {
          patientId: p.patient.id,
          date: new Date(Date.now() - n * MS_PER_DAY),
          basalBodyTemp: 97.2 + ((i + n) % 5) * 0.1,
          lhSurge: n % 4 === 0,
          cervicalMucus: pick(["Dry", "Creamy", "Egg-white"], n),
          intercourse: n % 3 === 0,
          medications: { list: p.patient.medications },
          notes: n % 2 === 0 ? "Tracking complete" : null,
        },
      });
    }
  }
}

async function ensurePregnancyRecord(patient) {
  const count = await prisma.pregnancyRecord.count({ where: { patientId: patient.id } });
  if (count > 0) return;

  const lmp = new Date(Date.now() - 70 * MS_PER_DAY);
  const dueDate = new Date(lmp.getTime() + 280 * MS_PER_DAY);
  await prisma.pregnancyRecord.create({
    data: {
      patientId: patient.id,
      lmp,
      dueDate,
      weeksAlong: 10,
      appointments: { prenatalVisits: 2 },
      symptoms: { nausea: true, fatigue: true },
      weight: 64.5,
      bloodPressure: { systolic: 118, diastolic: 74 },
      notes: "Healthy progression",
    },
  });
}

async function ensureClinicalData(patients, providers) {
  const meds = ["Metformin", "Spironolactone", "Sertraline", "Progesterone"];
  const labNames = [
    { testName: "AMH", testCode: "AMH-001" },
    { testName: "HbA1c", testCode: "HBA1C-010" },
    { testName: "TSH", testCode: "TSH-100" },
  ];

  for (let i = 0; i < patients.length; i += 1) {
    const p = patients[i];
    const provider = providers[i % providers.length].provider;
    const appointments = await prisma.appointment.findMany({
      where: { patientId: p.patient.id, providerId: provider.id },
      orderBy: { scheduledAt: "desc" },
    });
    const appointmentId = appointments.find((a) => a.status === AppointmentStatus.COMPLETED)?.id ?? appointments[0]?.id;

    const rxCount = await prisma.prescription.count({ where: { patientId: p.patient.id } });
    for (let n = rxCount; n < 2; n += 1) {
      await prisma.prescription.create({
        data: {
          patientId: p.patient.id,
          providerId: provider.id,
          appointmentId: appointmentId ?? null,
          medication: pick(meds, n + i),
          dosage: n % 2 === 0 ? "500mg" : "100mg",
          frequency: n % 2 === 0 ? "Twice daily" : "Daily",
          refills: 3,
          refillsRemaining: n === 0 ? 1 : 3,
          status: PrescriptionStatus.ACTIVE,
          startDate: new Date(Date.now() - 14 * MS_PER_DAY),
          instructions: "Take with meals",
          pharmacyName: "Acme Pharmacy, Seattle",
        },
      });
    }

    const labCount = await prisma.labResult.count({ where: { patientId: p.patient.id } });
    for (let n = labCount; n < 2; n += 1) {
      const lab = pick(labNames, n + i);
      await prisma.labResult.create({
        data: {
          patientId: p.patient.id,
          appointmentId: appointmentId ?? null,
          testName: lab.testName,
          testCode: `${lab.testCode}-${i + 1}`,
          status: n % 2 === 0 ? LabStatus.RESULTED : LabStatus.PROCESSING,
          orderedAt: new Date(Date.now() - (10 - n) * MS_PER_DAY),
          resultedAt: n % 2 === 0 ? new Date(Date.now() - (8 - n) * MS_PER_DAY) : null,
          results: n % 2 === 0 ? { value: 2.1 + i * 0.2, unit: "unit" } : null,
          normalRanges: { min: 1.0, max: 3.5 },
          isAbnormal: n % 2 === 0 && i % 2 === 0,
          labProvider: n % 2 === 0 ? LabProvider.LABCORP : LabProvider.QUEST,
        },
      });
    }

    const carePlanCount = await prisma.carePlan.count({ where: { patientId: p.patient.id } });
    if (carePlanCount < 1) {
      await prisma.carePlan.create({
        data: {
          patientId: p.patient.id,
          providerId: provider.id,
          title: `${p.condition} Management Plan`,
          condition: p.condition,
          goals: {
            goal_1: { text: "Stabilize symptoms", targetDate: new Date(Date.now() + 45 * MS_PER_DAY).toISOString() },
            goal_2: { text: "Improve quality of life", targetDate: new Date(Date.now() + 75 * MS_PER_DAY).toISOString() },
          },
          milestones: {
            milestone_1: { text: "Initial baseline labs", completed: true },
            milestone_2: { text: "4-week follow-up", completed: false },
          },
          status: CarePlanStatus.ACTIVE,
          startDate: new Date(Date.now() - 21 * MS_PER_DAY),
        },
      });
    }
  }
}

async function ensureConversations(patients, providers) {
  for (let i = 0; i < patients.length; i += 1) {
    const patient = patients[i];
    const provider = providers[i % providers.length];
    const conversation = await prisma.conversation.upsert({
      where: { patientId_providerId: { patientId: patient.patient.id, providerId: provider.provider.id } },
      update: { lastMessageAt: new Date() },
      create: {
        patientId: patient.patient.id,
        providerId: provider.provider.id,
        subject: `${patient.condition} follow-up`,
        lastMessageAt: new Date(),
      },
    });

    const msgCount = await prisma.message.count({ where: { conversationId: conversation.id } });
    if (msgCount < 3) {
      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            senderId: patient.user.id,
            content: "Hi doctor, sharing my latest symptom updates.",
            messageType: "TEXT",
          },
          {
            conversationId: conversation.id,
            senderId: provider.user.id,
            content: "Thanks. Continue logging daily and we will review together.",
            messageType: "TEXT",
          },
          {
            conversationId: conversation.id,
            senderId: patient.user.id,
            content: "Understood, thank you.",
            messageType: "TEXT",
          },
        ],
      });
    }
  }
}

async function ensureClaims(employerId) {
  const completedAppointments = await prisma.appointment.findMany({
    where: { status: AppointmentStatus.COMPLETED },
    include: { patient: true, provider: true },
    orderBy: { scheduledAt: "desc" },
    take: 20,
  });

  for (let i = 0; i < completedAppointments.length; i += 1) {
    const appt = completedAppointments[i];
    const claimNumber = `CLM-${appt.id.slice(-8).toUpperCase()}`;
    const exists = await prisma.insuranceClaim.findUnique({ where: { claimNumber }, select: { id: true } });
    if (exists) continue;

    const billed = 160 + (i % 4) * 25;
    const allowed = billed - 30;
    const paid = allowed - 10;
    await prisma.insuranceClaim.create({
      data: {
        patientId: appt.patientId,
        providerId: appt.providerId,
        appointmentId: appt.id,
        employerId,
        claimNumber,
        status: pick(
          [ClaimStatus.SUBMITTED, ClaimStatus.IN_REVIEW, ClaimStatus.APPROVED, ClaimStatus.PAID],
          i,
        ),
        serviceDate: appt.scheduledAt,
        diagnosisCodes: ["N97.9"],
        procedureCodes: ["99213"],
        billedAmount: billed,
        allowedAmount: allowed,
        paidAmount: paid,
      },
    });
  }
}

async function ensureReferralsAndAssessments(patients, providers) {
  for (let i = 0; i < patients.length; i += 1) {
    const p = patients[i];
    const provider = providers[i % providers.length].provider;

    const referralCount = await prisma.referral.count({ where: { patientId: p.patient.id } });
    if (referralCount < 1) {
      await prisma.referral.create({
        data: {
          patientId: p.patient.id,
          referringProviderId: provider.id,
          specialtyNeeded: i % 2 === 0 ? "Nutrition counseling" : "Behavioral therapy",
          urgency: i % 2 === 0 ? ReferralUrgency.ROUTINE : ReferralUrgency.URGENT,
          status: ReferralStatus.SENT,
          notes: "Integrated care referral from primary provider",
        },
      });
    }

    const mhCount = await prisma.mentalHealthAssessment.count({ where: { patientId: p.patient.id } });
    if (mhCount < 1) {
      await prisma.mentalHealthAssessment.create({
        data: {
          patientId: p.patient.id,
          providerId: providers[2]?.provider.id ?? provider.id,
          assessmentType: i % 2 === 0 ? AssessmentType.GAD7 : AssessmentType.PHQ9,
          responses: { q1: 2, q2: 1, q3: 2, q4: 1, q5: 2, q6: 1, q7: 1 },
          score: 9 + (i % 4),
          severity: i % 2 === 0 ? "Moderate" : "Mild",
          completedAt: new Date(Date.now() - (5 + i) * MS_PER_DAY),
        },
      });
    }
  }
}

async function ensureNotifications(users) {
  for (const user of users) {
    const count = await prisma.notification.count({ where: { userId: user.id } });
    if (count >= 3) continue;
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          type: "SYSTEM",
          title: "Welcome to Virtual Clinic",
          body: "Your account has been set up successfully.",
          isRead: false,
        },
        {
          userId: user.id,
          type: "REMINDER",
          title: "Profile updated",
          body: "Your demo profile and care records were refreshed.",
          isRead: true,
        },
        {
          userId: user.id,
          type: "ALERT",
          title: "New clinical activity available",
          body: "You have new appointments, messages, and care updates.",
          isRead: false,
        },
      ],
    });
  }
}

async function printSummary() {
  const [
    users,
    patients,
    providers,
    employers,
    appointments,
    symptoms,
    cycles,
    prescriptions,
    labs,
    plans,
    conversations,
    messages,
    claims,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.patient.count(),
    prisma.provider.count(),
    prisma.employer.count(),
    prisma.appointment.count(),
    prisma.symptomLog.count(),
    prisma.cycleTrack.count(),
    prisma.prescription.count(),
    prisma.labResult.count(),
    prisma.carePlan.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.insuranceClaim.count(),
  ]);

  console.log("Seed complete");
  console.log(
    `Counts => users:${users}, patients:${patients}, providers:${providers}, employers:${employers}, appointments:${appointments}, symptoms:${symptoms}, cycles:${cycles}, prescriptions:${prescriptions}, labs:${labs}, carePlans:${plans}, conversations:${conversations}, messages:${messages}, claims:${claims}`,
  );
}

async function seed() {
  const pwd = await hash("password123", 12);

  const employer = await prisma.employer.upsert({
    where: { domain: "acmecorp.com" },
    update: {
      name: "Acme Corp",
      contactEmail: "rachel.kim@acmecorp.com",
      plan: "PROFESSIONAL",
      employeeCount: 150,
      billingEmail: "billing@acmecorp.com",
      stripeCustomerId: "cus_mock_acme123",
      stripeSubscriptionId: "sub_mock_acme_pro_2026",
      ssoEnabled: true,
      ssoConfig: {
        provider: "Okta",
        domain: "acmecorp.okta.com",
        saml: true,
      },
    },
    create: {
      name: "Acme Corp",
      domain: "acmecorp.com",
      contactEmail: "rachel.kim@acmecorp.com",
      plan: "PROFESSIONAL",
      employeeCount: 150,
      billingEmail: "billing@acmecorp.com",
      stripeCustomerId: "cus_mock_acme123",
      stripeSubscriptionId: "sub_mock_acme_pro_2026",
      ssoEnabled: true,
      ssoConfig: {
        provider: "Okta",
        domain: "acmecorp.okta.com",
        saml: true,
      },
    },
  });

  const superAdmin = await upsertUser("admin@virtualclinic.com", Role.SUPER_ADMIN, pwd);
  const employerAdminUser = await upsertUser("rachel.kim@acmecorp.com", Role.EMPLOYER_ADMIN, pwd);

  await prisma.employerAdmin.upsert({
    where: { userId: employerAdminUser.id },
    update: { employerId: employer.id },
    create: { userId: employerAdminUser.id, employerId: employer.id },
  });

  const providers = await seedProviders(pwd);
  const patients = await seedPatients(pwd);

  await ensureAppointments(patients, providers);
  await ensureSymptoms(patients);
  await ensureCycles(patients);
  await ensureFertilityData(patients);
  await ensurePregnancyRecord(patients[0].patient);
  await ensureClinicalData(patients, providers);
  await ensureConversations(patients, providers);
  await ensureClaims(employer.id);
  await ensureReferralsAndAssessments(patients, providers);
  await ensureNotifications([
    ...patients.map((p) => p.user),
    ...providers.map((p) => p.user),
    employerAdminUser,
    superAdmin,
  ]);

  await printSummary();
  console.log("Credentials (all password: password123):");
  console.log(`PATIENT: ${patients.map((p) => p.user.email).join(", ")}`);
  console.log(`PROVIDER: ${providers.map((p) => p.user.email).join(", ")}`);
  console.log(`EMPLOYER_ADMIN: ${employerAdminUser.email}`);
  console.log(`SUPER_ADMIN: ${superAdmin.email}`);
  console.log(
    `Sample patient/provider pair: ${nameFromEmail(patients[0].user.email)} / Dr. ${nameFromEmail(
      providers[0].user.email,
    )}`,
  );
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
