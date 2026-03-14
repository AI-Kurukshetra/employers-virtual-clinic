const { PrismaClient, Role, AppointmentType, AppointmentStatus, CycleFlow, PrescriptionStatus, LabStatus, LabProvider, CarePlanStatus, ReferralUrgency, ReferralStatus, AssessmentType } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function upsertUser(email, role, passwordHash) {
  return prisma.user.upsert({
    where: { email },
    update: { role, password: passwordHash },
    create: { email, role, password: passwordHash },
  })
}

async function seed() {
  const pwd = await hash('password123', 12)

  const employer = await prisma.employer.upsert({
    where: { domain: 'acmecorp.com' },
    update: {
      name: 'Acme Corp',
      contactEmail: 'rachel.kim@acmecorp.com',
      plan: 'PROFESSIONAL',
      employeeCount: 150,
      billingEmail: 'billing@acmecorp.com',
      stripeCustomerId: 'cus_mock_acme123',
    },
    create: {
      name: 'Acme Corp',
      domain: 'acmecorp.com',
      contactEmail: 'rachel.kim@acmecorp.com',
      plan: 'PROFESSIONAL',
      employeeCount: 150,
      billingEmail: 'billing@acmecorp.com',
      stripeCustomerId: 'cus_mock_acme123',
    },
  })

  const superAdmin = await upsertUser('admin@virtualclinic.com', Role.SUPER_ADMIN, pwd)
  const employerAdminUser = await upsertUser('rachel.kim@acmecorp.com', Role.EMPLOYER_ADMIN, pwd)

  await prisma.employerAdmin.upsert({
    where: { userId: employerAdminUser.id },
    update: { employerId: employer.id },
    create: { userId: employerAdminUser.id, employerId: employer.id },
  })

  const providerDefs = [
    {
      email: 'sarah.chen@virtualclinic.com',
      specialty: 'OB/GYN',
      licenseNumber: 'WA-OB-11021',
      licenseState: 'WA',
      npiNumber: '1225533331',
      languages: ['English', 'Mandarin'],
      rating: 4.9,
      bio: 'Specializes in PCOS, fertility, and menstrual health care.',
    },
    {
      email: 'maya.patel@virtualclinic.com',
      specialty: 'Endocrinologist',
      licenseNumber: 'WA-ENDO-22011',
      licenseState: 'WA',
      npiNumber: '1886622219',
      languages: ['English', 'Hindi'],
      rating: 4.8,
      bio: 'Hormonal and metabolic health expert focused on long-term outcomes.',
    },
    {
      email: 'lisa.torres@virtualclinic.com',
      specialty: 'Mental Health',
      licenseNumber: 'WA-MH-33010',
      licenseState: 'WA',
      npiNumber: '1997733312',
      languages: ['English', 'Spanish'],
      rating: 4.95,
      bio: 'Perinatal and anxiety-focused behavioral care with integrated plans.',
    },
  ]

  const providers = []
  for (const def of providerDefs) {
    const user = await upsertUser(def.email, Role.PROVIDER, pwd)
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
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '10:00', end: '18:00' }],
          friday: [{ start: '09:00', end: '14:00' }],
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
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '10:00', end: '18:00' }],
          friday: [{ start: '09:00', end: '14:00' }],
        },
      },
    })
    providers.push({ user, provider })
  }

  const patientDefs = [
    {
      email: 'emma.johnson@gmail.com',
      dateOfBirth: '1994-04-11',
      phoneNumber: '+1-206-555-0111',
      insuranceProvider: 'BlueCross',
      insuranceId: 'BC-EMMA-1001',
      condition: 'PCOS',
    },
    {
      email: 'sophia.w@gmail.com',
      dateOfBirth: '1998-07-02',
      phoneNumber: '+1-206-555-0112',
      insuranceProvider: 'Aetna',
      insuranceId: 'AE-SOPHIA-2001',
      condition: 'Fertility tracking',
    },
    {
      email: 'olivia.m@gmail.com',
      dateOfBirth: '1991-09-19',
      phoneNumber: '+1-206-555-0113',
      insuranceProvider: 'United',
      insuranceId: 'UN-OLIVIA-3001',
      condition: 'Endometriosis',
    },
    {
      email: 'ava.t@gmail.com',
      dateOfBirth: '1996-12-22',
      phoneNumber: '+1-206-555-0114',
      insuranceProvider: 'Cigna',
      insuranceId: 'CI-AVA-4001',
      condition: 'Anxiety + Hormonal',
    },
  ]

  const patients = []
  for (const def of patientDefs) {
    const user = await upsertUser(def.email, Role.PATIENT, pwd)
    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {
        dateOfBirth: new Date(def.dateOfBirth),
        phoneNumber: def.phoneNumber,
        insuranceProvider: def.insuranceProvider,
        insuranceId: def.insuranceId,
        address: { line1: '100 Demo St', city: 'Seattle', state: 'WA', zip: '98101' },
        emergencyContact: { name: 'Emergency Contact', phone: '+1-206-555-0199', relation: 'Family' },
        medicalHistory: { primaryCondition: def.condition },
        allergies: [],
        medications: [],
      },
      create: {
        userId: user.id,
        dateOfBirth: new Date(def.dateOfBirth),
        phoneNumber: def.phoneNumber,
        insuranceProvider: def.insuranceProvider,
        insuranceId: def.insuranceId,
        address: { line1: '100 Demo St', city: 'Seattle', state: 'WA', zip: '98101' },
        emergencyContact: { name: 'Emergency Contact', phone: '+1-206-555-0199', relation: 'Family' },
        medicalHistory: { primaryCondition: def.condition },
        allergies: [],
        medications: [],
      },
    })
    patients.push({ user, patient, condition: def.condition })
  }

  const appointmentsCount = await prisma.appointment.count({
    where: { patientId: { in: patients.map((p) => p.patient.id) } },
  })

  if (appointmentsCount < 12) {
    const complaints = [
      'Irregular periods for 3 months',
      'Fertility consultation - trying to conceive',
      'Pelvic pain management',
      'Anxiety and mood swings',
      'Follow-up: hormone panel results',
      'Endometriosis flare-up',
      'Birth control discussion',
      'Postpartum check-in',
    ]
    const statuses = [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.IN_PROGRESS,
    ]
    const types = [AppointmentType.VIDEO, AppointmentType.CHAT, AppointmentType.AUDIO]

    for (let i = 0; i < 16; i++) {
      const patient = patients[i % patients.length].patient
      const provider = providers[i % providers.length].provider
      const scheduledAt = new Date(Date.now() + (i - 10) * 24 * 60 * 60 * 1000)
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          providerId: provider.id,
          type: types[i % types.length],
          status: statuses[i % statuses.length],
          scheduledAt,
          duration: 30,
          chiefComplaint: complaints[i % complaints.length],
          notes: i % 2 === 0 ? 'Patient progressing well with current plan.' : null,
          videoRoomId: `room-${i + 1}`,
        },
      })
    }
  }

  for (const p of patients.slice(0, 2)) {
    const symptomCount = await prisma.symptomLog.count({ where: { patientId: p.patient.id } })
    if (symptomCount < 10) {
      for (let d = 1; d <= 14; d++) {
        await prisma.symptomLog.create({
          data: {
            patientId: p.patient.id,
            date: new Date(Date.now() - d * 24 * 60 * 60 * 1000),
            symptoms: { tags: d % 3 === 0 ? ['cramps', 'fatigue'] : ['bloating'] },
            mood: p.user.email.includes('emma') ? 5 + (d % 3) : 6 + (d % 3),
            energy: p.user.email.includes('emma') ? 4 + (d % 3) : 6 + (d % 2),
            sleep: 6.5 + (d % 2) * 0.5,
            pain: p.user.email.includes('emma') ? 3 + (d % 3) : 1 + (d % 2),
            notes: d % 5 === 0 ? 'Mild symptoms today' : null,
          },
        })
      }
    }
  }

  for (const p of patients.slice(0, 2)) {
    const cycleCount = await prisma.cycleTrack.count({ where: { patientId: p.patient.id } })
    if (cycleCount < 6) {
      for (let m = 0; m < 6; m++) {
        const start = new Date(Date.now() - (m + 1) * 30 * 24 * 60 * 60 * 1000)
        const end = new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000)
        await prisma.cycleTrack.create({
          data: {
            patientId: p.patient.id,
            periodStart: start,
            periodEnd: end,
            cycleLength: p.user.email.includes('emma') ? 32 + (m % 3) : 28 + (m % 2),
            ovulationDate: new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000),
            symptoms: ['cramps'],
            flow: m % 3 === 0 ? CycleFlow.HEAVY : CycleFlow.MEDIUM,
            notes: null,
          },
        })
      }
    }
  }

  const primaryProvider = providers[0].provider
  const primaryPatient = patients[0].patient

  const rxCount = await prisma.prescription.count({ where: { patientId: primaryPatient.id } })
  if (rxCount < 3) {
    await prisma.prescription.createMany({
      data: [
        {
          patientId: primaryPatient.id,
          providerId: primaryProvider.id,
          medication: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          refills: 3,
          refillsRemaining: 3,
          status: PrescriptionStatus.ACTIVE,
          startDate: new Date(),
          instructions: 'Take with meals',
        },
        {
          patientId: primaryPatient.id,
          providerId: primaryProvider.id,
          medication: 'Spironolactone',
          dosage: '100mg',
          frequency: 'Daily',
          refills: 2,
          refillsRemaining: 2,
          status: PrescriptionStatus.ACTIVE,
          startDate: new Date(),
          instructions: 'For PCOS management',
        },
      ],
    })
  }

  const labCount = await prisma.labResult.count({ where: { patientId: primaryPatient.id } })
  if (labCount < 3) {
    await prisma.labResult.createMany({
      data: [
        {
          patientId: primaryPatient.id,
          testName: 'AMH',
          testCode: 'AMH-001',
          status: LabStatus.RESULTED,
          orderedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          resultedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          results: { value: 0.8, unit: 'ng/mL' },
          normalRanges: { min: 1.0, max: 3.5 },
          isAbnormal: true,
          labProvider: LabProvider.LABCORP,
        },
        {
          patientId: primaryPatient.id,
          testName: 'HbA1c',
          testCode: 'HBA1C-010',
          status: LabStatus.PROCESSING,
          orderedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          labProvider: LabProvider.LABCORP,
        },
      ],
    })
  }

  const carePlanCount = await prisma.carePlan.count({ where: { patientId: primaryPatient.id } })
  if (carePlanCount < 2) {
    await prisma.carePlan.create({
      data: {
        patientId: primaryPatient.id,
        providerId: primaryProvider.id,
        title: 'PCOS Management Plan',
        condition: 'PCOS',
        goals: {
          goals: ['Regulate menstrual cycle', 'Improve insulin sensitivity', 'Reduce androgen symptoms'],
        },
        milestones: {
          items: [
            { title: 'Start Metformin - Week 1', completed: true },
            { title: 'Blood work panel - Week 4', completed: true },
            { title: 'Follow-up ultrasound - Week 8', completed: false },
          ],
        },
        status: CarePlanStatus.ACTIVE,
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      },
    })
  }

  const convo = await prisma.conversation.upsert({
    where: { patientId_providerId: { patientId: primaryPatient.id, providerId: primaryProvider.id } },
    update: { lastMessageAt: new Date() },
    create: {
      patientId: primaryPatient.id,
      providerId: primaryProvider.id,
      subject: 'PCOS follow-up',
      lastMessageAt: new Date(),
    },
  })

  const msgCount = await prisma.message.count({ where: { conversationId: convo.id } })
  if (msgCount < 4) {
    await prisma.message.createMany({
      data: [
        { conversationId: convo.id, senderId: primaryPatient.userId, content: 'Hi doctor, my cycle is irregular this month.', messageType: 'TEXT' },
        { conversationId: convo.id, senderId: providers[0].user.id, content: 'Thanks for sharing. Please continue symptom tracking daily.', messageType: 'TEXT' },
        { conversationId: convo.id, senderId: primaryPatient.userId, content: 'Should I adjust Metformin timing?', messageType: 'TEXT' },
        { conversationId: convo.id, senderId: providers[0].user.id, content: 'Keep current timing and we will review labs next visit.', messageType: 'TEXT' },
      ],
    })
  }

  const notifUsers = [
    ...patients.map((p) => p.user),
    ...providers.map((p) => p.user),
    employerAdminUser,
    superAdmin,
  ]
  for (const u of notifUsers) {
    const count = await prisma.notification.count({ where: { userId: u.id } })
    if (count < 2) {
      await prisma.notification.createMany({
        data: [
          {
            userId: u.id,
            type: 'SYSTEM',
            title: 'Welcome to Virtual Clinic',
            body: 'Your account has been set up successfully.',
            isRead: false,
          },
          {
            userId: u.id,
            type: 'REMINDER',
            title: 'Complete profile',
            body: 'Add or review your profile details for best experience.',
            isRead: true,
          },
        ],
      })
    }
  }

  const referralCount = await prisma.referral.count({ where: { patientId: primaryPatient.id } })
  if (referralCount < 1) {
    await prisma.referral.create({
      data: {
        patientId: primaryPatient.id,
        referringProviderId: primaryProvider.id,
        specialtyNeeded: 'Nutrition counseling',
        urgency: ReferralUrgency.ROUTINE,
        status: ReferralStatus.SENT,
        notes: 'Dietary support for insulin resistance',
      },
    })
  }

  const mhCount = await prisma.mentalHealthAssessment.count({ where: { patientId: patients[3].patient.id } })
  if (mhCount < 1) {
    await prisma.mentalHealthAssessment.create({
      data: {
        patientId: patients[3].patient.id,
        providerId: providers[2].provider.id,
        assessmentType: AssessmentType.GAD7,
        responses: { q1: 2, q2: 1, q3: 2, q4: 1, q5: 2, q6: 1, q7: 1 },
        score: 10,
        severity: 'Moderate',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('Seed complete')
  console.log('Credentials (all password: password123):')
  console.log('PATIENT:', patients.map((p) => p.user.email).join(', '))
  console.log('PROVIDER:', providers.map((p) => p.user.email).join(', '))
  console.log('EMPLOYER_ADMIN:', employerAdminUser.email)
  console.log('SUPER_ADMIN:', superAdmin.email)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
