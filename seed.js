import mongoose from "mongoose";
import { config } from "dotenv";
import plansData from "./Drefitness.plans.json";
import { v4 as uuidv4 } from "uuid"; // For generating transaction references
import Plan from "./models/plan";
import Member, { Counter } from "./models/member";
import { calculateEndDate, hashPassword } from "./lib/util";

config();

// const nigerianNames = [
//   { firstName: "Chukwudi", lastName: "Okeke", gender: "male" },
//   { firstName: "Ngozi", lastName: "Adebayo", gender: "female" },
//   { firstName: "Olumide", lastName: "Ibrahim", gender: "male" },
//   { firstName: "Aisha", lastName: "Suleiman", gender: "female" },
//   { firstName: "Emeka", lastName: "Chukwu", gender: "male" },
//   { firstName: "Funmilayo", lastName: "Ogunleye", gender: "female" },
//   { firstName: "Tunde", lastName: "Balogun", gender: "male" },
//   { firstName: "Chioma", lastName: "Eze", gender: "female" },
//   { firstName: "Yusuf", lastName: "Abdullahi", gender: "male" },
//   { firstName: "Amaka", lastName: "Nwosu", gender: "female" },
//   { firstName: "Segun", lastName: "Akinyemi", gender: "male" },
//   { firstName: "Hauwa", lastName: "Bello", gender: "female" },
//   { firstName: "Ifeanyi", lastName: "Okafor", gender: "male" },
//   { firstName: "Kemi", lastName: "Adetunji", gender: "female" },
//   { firstName: "Ahmed", lastName: "Lawal", gender: "male" },
// ];
// const addresses = {
//   "ilorin-gra": {
//     street: "1 Ahmadu Bello Way",
//     city: "Ilorin",
//     state: "Kwara",
//     country: "Nigeria",
//   },
//   "ilorin-tanke": {
//     street: "10 University Road, Tanke",
//     city: "Ilorin",
//     state: "Kwara",
//     country: "Nigeria",
//   },
//   "abuja-wuse": {
//     street: "25 Aminu Kano Crescent",
//     city: "Abuja",
//     state: "FCT",
//     country: "Nigeria",
//   },
// };

// // Plan IDs by Branch
// const planIds = {
//   "ilorin-gra": {
//     individual: "67d193764f6e0dccb8277e7d",
//     couple: "67d19044aa1d17317dc3c4f2",
//     family: "67d1935f4f6e0dccb8277e77",
//   },
//   "ilorin-tanke": {
//     individual: "67f43a3ce799038c6c56eb42",
//     couple: "67f43a1fe799038c6c56eb3e",
//     family: "67f43a04e799038c6c56eb3a",
//   },
//   "abuja-wuse": {
//     individual: "67f43a8de799038c6c56eb46",
//     couple: "67f43aace799038c6c56eb4a",
//     family: "67f43ac5e799038c6c56eb4e",
//   },
// };

// // Generate Random Date of Birth
// function randomDateOfBirth() {
//   const start = new Date(1970, 0, 1);
//   const end = new Date(2005, 0, 1);
//   return new Date(
//     start.getTime() + Math.random() * (end.getTime() - start.getTime())
//   );
// }

// // Generate Phone Number
// function generatePhoneNumber() {
//   const prefix = "+234";
//   const number = Math.floor(100000000 + Math.random() * 900000000);
//   return `${prefix}${number}`;
// }

// // Generate Subscription Start Date
// function generateStartDate(monthIndex) {
//   const year = 2022 + Math.floor(monthIndex / 12);
//   const month = monthIndex % 12;
//   const day = Math.floor(Math.random() * 28) + 1; // Avoid edge cases with month lengths
//   return new Date(year, month, day);
// }

// // Seed Function
// export async function seedDatabase() {
//   try {
//     // Connect to MongoDB
//     await mongoose.connect(
//       process.env.MONGO_URI || "mongodb://localhost:27017/drefitness"
//     );
//     console.log("Connected to MongoDB");

//     // Clear Members with role: "member"
//     await Member.deleteMany({ role: "member" });
//     console.log("Cleared members with role 'member'");

//     // Seed Counter (if not exists)
//     const counterExists = await Counter.findOne({ collectionName: "members" });
//     if (!counterExists) {
//       await Counter.create({ collectionName: "members", count: 0 });
//       console.log("Seeded Counter collection");
//     } else {
//       console.log("Counter collection already exists");
//     }

//     // Seed Members
//     const branches = ["ilorin-gra", "ilorin-tanke", "abuja-wuse"];
//     const insertedMembers = [];
//     let nameIndex = 0;
//     const currentDate = new Date("2025-05-05");
//     const hashedPassword = await hashPassword("123456789");

//     // Generate subscription start dates (41 months: Jan 2022 to May 2025)
//     const months = Array.from({ length: 41 }, (_, i) => i); // 0 to 40
//     const membersPerMonth = Math.ceil(300 / 41); // ~7.3 members per month
//     let monthIndex = 0;

//     for (const branch of branches) {
//       // Individual Members (40 per branch)
//       for (let i = 0; i < 40; i++) {
//         const name = nigerianNames[nameIndex % nigerianNames.length];
//         const email = `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}${nameIndex}@example.com`;
//         const startDate = generateStartDate(months[monthIndex % months.length]);
//         const plan = await Plan.findById(planIds[branch].individual);
//         const endDate = calculateEndDate(startDate, plan.duration);
//         const subscriptionStatus = endDate > currentDate ? "active" : "expired";
//         const member = await Member.create({
//           firstName: name.firstName,
//           lastName: name.lastName,
//           email,
//           password: hashedPassword,
//           phoneNumber: generatePhoneNumber(),
//           dateOfBirth: randomDateOfBirth(),
//           gender: name.gender,
//           address: addresses[branch],
//           emergencyContact: {
//             fullName: `${
//               nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
//             } ${
//               nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
//             }`,
//             phoneNumber: generatePhoneNumber(),
//             relationship: "friend",
//           },
//           role: "member",
//           isActive: subscriptionStatus === "active",
//           registrationDate: startDate,
//           currentSubscription: {
//             plan: planIds[branch].individual,
//             subscriptionStatus,
//             startDate,
//             endDate,
//             autoRenew: false,
//             paymentMethod: "card",
//             paymentStatus: "approved",
//             transactionReference: uuidv4().slice(0, 10),
//           },
//           membershipHistory: [
//             {
//               plan: planIds[branch].individual,
//               startDate,
//               endDate,
//             },
//           ],
//           isGroup: false,
//           groupRole: "none",
//         });
//         insertedMembers.push(member);
//         nameIndex++;
//         if (i % membersPerMonth === membersPerMonth - 1) monthIndex++;
//       }

//       // Couple Members (12 couples = 24 members per branch)
//       for (let i = 0; i < 12; i++) {
//         // Primary Member
//         const primaryName = nigerianNames[nameIndex % nigerianNames.length];
//         const primaryEmail = `${primaryName.firstName.toLowerCase()}.${primaryName.lastName.toLowerCase()}${nameIndex}@example.com`;
//         const startDate = generateStartDate(months[monthIndex % months.length]);
//         const plan = await Plan.findById(planIds[branch].couple);
//         const endDate = calculateEndDate(startDate, plan.duration);
//         const subscriptionStatus = endDate > currentDate ? "active" : "expired";
//         const primaryMember = await Member.create({
//           firstName: primaryName.firstName,
//           lastName: primaryName.lastName,
//           email: primaryEmail,
//           password: hashedPassword,
//           phoneNumber: generatePhoneNumber(),
//           dateOfBirth: randomDateOfBirth(),
//           gender: primaryName.gender,
//           address: addresses[branch],
//           emergencyContact: {
//             fullName: `${
//               nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
//             } ${
//               nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
//             }`,
//             phoneNumber: generatePhoneNumber(),
//             relationship: "spouse",
//           },
//           role: "member",
//           isActive: subscriptionStatus === "active",
//           registrationDate: startDate,
//           currentSubscription: {
//             plan: planIds[branch].couple,
//             subscriptionStatus,
//             startDate,
//             endDate,
//             autoRenew: false,
//             paymentMethod: "card",
//             paymentStatus: "approved",
//             transactionReference: uuidv4().slice(0, 10),
//           },
//           membershipHistory: [
//             {
//               plan: planIds[branch].couple,
//               startDate,
//               endDate,
//             },
//           ],
//           isGroup: true,
//           groupRole: "primary",
//           groupSubscription: {
//             groupType: "couple",
//             groupMaxMember: 2,
//             groupInviteToken: uuidv4(),
//             dependantMembers: [],
//           },
//         });
//         insertedMembers.push(primaryMember);
//         nameIndex++;
//         if (i % Math.ceil(12 / membersPerMonth) === 0) monthIndex++;

//         // Dependant Member
//         const dependantName = nigerianNames[nameIndex % nigerianNames.length];
//         const dependantEmail = `${dependantName.firstName.toLowerCase()}.${dependantName.lastName.toLowerCase()}${nameIndex}@example.com`;
//         const dependantMember = await Member.create({
//           firstName: dependantName.firstName,
//           lastName: dependantName.lastName,
//           email: dependantEmail,
//           password: hashedPassword,
//           phoneNumber: generatePhoneNumber(),
//           dateOfBirth: randomDateOfBirth(),
//           gender: dependantName.gender,
//           address: addresses[branch],
//           emergencyContact: {
//             fullName: `${primaryName.firstName} ${primaryName.lastName}`,
//             phoneNumber: generatePhoneNumber(),
//             relationship: "spouse",
//           },
//           role: "member",
//           isActive: subscriptionStatus === "active",
//           registrationDate: startDate,
//           currentSubscription: {
//             plan: planIds[branch].couple,
//             subscriptionStatus,
//             startDate,
//             endDate,
//             autoRenew: false,
//             paymentMethod: "card",
//             paymentStatus: "approved",
//             transactionReference: uuidv4().slice(0, 10),
//           },
//           membershipHistory: [
//             {
//               plan: planIds[branch].couple,
//               startDate,
//               endDate,
//             },
//           ],
//           isGroup: true,
//           groupRole: "dependant",
//           groupSubscription: {
//             groupType: "couple",
//             primaryMember: primaryMember._id,
//           },
//         });
//         insertedMembers.push(dependantMember);

//         // Update Primary Member's dependantMembers
//         primaryMember.groupSubscription.dependantMembers.push({
//           member: dependantMember._id,
//           status: "active",
//           joinedAt: startDate,
//         });
//         await primaryMember.save();
//         nameIndex++;
//       }

//       // Family Members (9 families = 36 members per branch, 1 primary + 3 dependants each)
//       for (let i = 0; i < 9; i++) {
//         // Primary Member
//         const primaryName = nigerianNames[nameIndex % nigerianNames.length];
//         const primaryEmail = `${primaryName.firstName.toLowerCase()}.${primaryName.lastName.toLowerCase()}${nameIndex}@example.com`;
//         const startDate = generateStartDate(months[monthIndex % months.length]);
//         const plan = await Plan.findById(planIds[branch].family);
//         const endDate = calculateEndDate(startDate, plan.duration);
//         const subscriptionStatus = endDate > currentDate ? "active" : "expired";
//         const primaryMember = await Member.create({
//           firstName: primaryName.firstName,
//           lastName: primaryName.lastName,
//           email: primaryEmail,
//           password: hashedPassword,
//           phoneNumber: generatePhoneNumber(),
//           dateOfBirth: randomDateOfBirth(),
//           gender: primaryName.gender,
//           address: addresses[branch],
//           emergencyContact: {
//             fullName: `${
//               nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
//             } ${
//               nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
//             }`,
//             phoneNumber: generatePhoneNumber(),
//             relationship: "spouse",
//           },
//           role: "member",
//           isActive: subscriptionStatus === "active",
//           registrationDate: startDate,
//           currentSubscription: {
//             plan: planIds[branch].family,
//             subscriptionStatus,
//             startDate,
//             endDate,
//             autoRenew: false,
//             paymentMethod: "card",
//             paymentStatus: "approved",
//             transactionReference: uuidv4().slice(0, 10),
//           },
//           membershipHistory: [
//             {
//               plan: planIds[branch].family,
//               startDate,
//               endDate,
//             },
//           ],
//           isGroup: true,
//           groupRole: "primary",
//           groupSubscription: {
//             groupType: "family",
//             groupMaxMember: 4,
//             groupInviteToken: uuidv4(),
//             dependantMembers: [],
//           },
//         });
//         insertedMembers.push(primaryMember);
//         nameIndex++;
//         if (i % Math.ceil(9 / membersPerMonth) === 0) monthIndex++;

//         // Three Dependant Members
//         for (let j = 0; j < 3; j++) {
//           const dependantName = nigerianNames[nameIndex % nigerianNames.length];
//           const dependantEmail = `${dependantName.firstName.toLowerCase()}.${dependantName.lastName.toLowerCase()}${nameIndex}@example.com`;
//           const dependantMember = await Member.create({
//             firstName: dependantName.firstName,
//             lastName: dependantName.lastName,
//             email: dependantEmail,
//             password: hashedPassword,
//             phoneNumber: generatePhoneNumber(),
//             dateOfBirth: randomDateOfBirth(),
//             gender: dependantName.gender,
//             address: addresses[branch],
//             emergencyContact: {
//               fullName: `${primaryName.firstName} ${primaryName.lastName}`,
//               phoneNumber: generatePhoneNumber(),
//               relationship: j === 0 ? "spouse" : "child",
//             },
//             role: "member",
//             isActive: subscriptionStatus === "active",
//             registrationDate: startDate,
//             currentSubscription: {
//               plan: planIds[branch].family,
//               subscriptionStatus,
//               startDate,
//               endDate,
//               autoRenew: false,
//               paymentMethod: "card",
//               paymentStatus: "approved",
//               transactionReference: uuidv4().slice(0, 10),
//             },
//             membershipHistory: [
//               {
//                 plan: planIds[branch].family,
//                 startDate,
//                 endDate,
//               },
//             ],
//             isGroup: true,
//             groupRole: "dependant",
//             groupSubscription: {
//               groupType: "family",
//               primaryMember: primaryMember._id,
//             },
//           });
//           insertedMembers.push(dependantMember);

//           // Update Primary Member's dependantMembers
//           primaryMember.groupSubscription.dependantMembers.push({
//             member: dependantMember._id,
//             status: "active",
//             joinedAt: startDate,
//           });
//           await primaryMember.save();
//           nameIndex++;
//         }
//       }
//     }

//     console.log(`Seeded ${insertedMembers.length} members`);
//   } catch (error) {
//     console.error("Error seeding database:", error);
//   } finally {
//     await mongoose.disconnect();
//     console.log("Disconnected from MongoDB");
//   }
// }

const nigerianNames = [
  { firstName: "Chukwudi", lastName: "Okeke", gender: "male" },
  { firstName: "Ngozi", lastName: "Adebayo", gender: "female" },
  { firstName: "Olumide", lastName: "Ibrahim", gender: "male" },
  { firstName: "Aisha", lastName: "Suleiman", gender: "female" },
  { firstName: "Emeka", lastName: "Chukwu", gender: "male" },
  { firstName: "Funmilayo", lastName: "Ogunleye", gender: "female" },
  { firstName: "Tunde", lastName: "Balogun", gender: "male" },
  { firstName: "Chioma", lastName: "Eze", gender: "female" },
  { firstName: "Yusuf", lastName: "Abdullahi", gender: "male" },
  { firstName: "Amaka", lastName: "Nwosu", gender: "female" },
  { firstName: "Segun", lastName: "Akinyemi", gender: "male" },
  { firstName: "Hauwa", lastName: "Bello", gender: "female" },
  { firstName: "Ifeanyi", lastName: "Okafor", gender: "male" },
  { firstName: "Kemi", lastName: "Adetunji", gender: "female" },
  { firstName: "Ahmed", lastName: "Lawal", gender: "male" },
];
const addresses = {
  "ilorin-gra": {
    street: "1 Ahmadu Bello Way",
    city: "Ilorin",
    state: "Kwara",
    country: "Nigeria",
  },
  "ilorin-tanke": {
    street: "10 University Road, Tanke",
    city: "Ilorin",
    state: "Kwara",
    country: "Nigeria",
  },
  "abuja-wuse": {
    street: "25 Aminu Kano Crescent",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
  },
};

// Plan IDs by Branch
const planIds = {
  "ilorin-gra": {
    individual: "67d193764f6e0dccb8277e7d",
    couple: "67d19044aa1d17317dc3c4f2",
    family: "67d1935f4f6e0dccb8277e77",
  },
  "ilorin-tanke": {
    individual: "67f43a3ce799038c6c56eb42",
    couple: "67f43a1fe799038c6c56eb3e",
    family: "67f43a04e799038c6c56eb3a",
  },
  "abuja-wuse": {
    individual: "67f43a8de799038c6c56eb46",
    couple: "67f43aace799038c6c56eb4a",
    family: "67f43ac5e799038c6c56eb4e",
  },
};

// Generate Random Date of Birth
function randomDateOfBirth() {
  const start = new Date(1970, 0, 1);
  const end = new Date(2005, 0, 1);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Generate Phone Number
function generatePhoneNumber() {
  const prefix = "+234";
  const number = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${number}`;
}

// Generate Subscription Start Date
function generateStartDate(isActive, monthIndex) {
  if (isActive) {
    // Active: Jan 1, 2025 to May 5, 2025
    const start = new Date(2025, 0, 1);
    const end = new Date(2025, 4, 5);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    const randomDay = Math.floor(Math.random() * days);
    return new Date(start.getTime() + randomDay * 24 * 60 * 60 * 1000);
  } else {
    // Expired: Jan 1, 2022 to Dec 31, 2024
    const year = 2022 + Math.floor(monthIndex / 12);
    const month = monthIndex % 12;
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }
}

// Seed Function
export async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/drefitness"
    );
    console.log("Connected to MongoDB");

    // Clear Members with role: "member"
    await Member.deleteMany({ role: "member" });
    console.log("Cleared members with role 'member'");

    // Seed Counter (if not exists)
    const counterExists = await Counter.findOne({ collectionName: "members" });
    if (!counterExists) {
      await Counter.create({ collectionName: "members", count: 0 });
      console.log("Seeded Counter collection");
    } else {
      console.log("Counter collection already exists");
    }

    // Seed Members
    const branches = ["ilorin-gra", "ilorin-tanke", "abuja-wuse"];
    const insertedMembers = [];
    let nameIndex = 0;
    const currentDate = new Date("2025-05-05");
    const hashedPassword = await hashPassword("123456789");

    // Generate subscription months
    const expiredMonths = Array.from({ length: 36 }, (_, i) => i); // Jan 2022 to Dec 2024
    let expiredMonthIndex = 0;
    const activeMembersPerBranch = 50; // Half of 100
    const expiredMembersPerBranch = 50;
    const membersPerExpiredMonth = Math.ceil(150 / 36); // ~4.2 members per month for expired

    for (const branch of branches) {
      // Individual Members (40 per branch: 20 active, 20 expired)
      for (let i = 0; i < 40; i++) {
        const isActive = i < 20; // First 20 are active
        const name = nigerianNames[nameIndex % nigerianNames.length];
        const email = `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}${nameIndex}@example.com`;
        const startDate = generateStartDate(
          isActive,
          expiredMonths[expiredMonthIndex % expiredMonths.length]
        );
        const plan = await Plan.findById(planIds[branch].individual);
        const endDate = calculateEndDate(startDate, plan.duration);
        const subscriptionStatus = isActive ? "active" : "expired";
        const member = await Member.create({
          firstName: name.firstName,
          lastName: name.lastName,
          email,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: name.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
            } ${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
            }`,
            phoneNumber: generatePhoneNumber(),
            relationship: "friend",
          },
          role: "member",
          isActive: isActive,
          registrationDate: startDate,
          currentSubscription: {
            plan: planIds[branch].individual,
            subscriptionStatus,
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].individual,
              startDate,
              endDate,
            },
          ],
          isGroup: false,
          groupRole: "none",
        });
        insertedMembers.push(member);
        nameIndex++;
        if (
          !isActive &&
          i % membersPerExpiredMonth === membersPerExpiredMonth - 1
        )
          expiredMonthIndex++;
      }

      // Couple Members (12 couples = 24 members per branch: 6 active, 6 expired)
      for (let i = 0; i < 12; i++) {
        const isActive = i < 6; // First 6 couples are active
        // Primary Member
        const primaryName = nigerianNames[nameIndex % nigerianNames.length];
        const primaryEmail = `${primaryName.firstName.toLowerCase()}.${primaryName.lastName.toLowerCase()}${nameIndex}@example.com`;
        const startDate = generateStartDate(
          isActive,
          expiredMonths[expiredMonthIndex % expiredMonths.length]
        );
        const plan = await Plan.findById(planIds[branch].couple);
        const endDate = calculateEndDate(startDate, plan.duration);
        const subscriptionStatus = isActive ? "active" : "expired";
        const primaryMember = await Member.create({
          firstName: primaryName.firstName,
          lastName: primaryName.lastName,
          email: primaryEmail,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: primaryName.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
            } ${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
            }`,
            phoneNumber: generatePhoneNumber(),
            relationship: "spouse",
          },
          role: "member",
          isActive: isActive,
          registrationDate: startDate,
          currentSubscription: {
            plan: planIds[branch].couple,
            subscriptionStatus,
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].couple,
              startDate,
              endDate,
            },
          ],
          isGroup: true,
          groupRole: "primary",
          groupSubscription: {
            groupType: "couple",
            groupMaxMember: 2,
            groupInviteToken: uuidv4(),
            dependantMembers: [],
          },
        });
        insertedMembers.push(primaryMember);
        nameIndex++;
        if (!isActive && i % Math.ceil(6 / membersPerExpiredMonth) === 0)
          expiredMonthIndex++;

        // Dependant Member
        const dependantName = nigerianNames[nameIndex % nigerianNames.length];
        const dependantEmail = `${dependantName.firstName.toLowerCase()}.${dependantName.lastName.toLowerCase()}${nameIndex}@example.com`;
        const dependantMember = await Member.create({
          firstName: dependantName.firstName,
          lastName: dependantName.lastName,
          email: dependantEmail,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: dependantName.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${primaryName.firstName} ${primaryName.lastName}`,
            phoneNumber: generatePhoneNumber(),
            relationship: "spouse",
          },
          role: "member",
          isActive: isActive,
          registrationDate: startDate,
          currentSubscription: {
            plan: planIds[branch].couple,
            subscriptionStatus,
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].couple,
              startDate,
              endDate,
            },
          ],
          isGroup: true,
          groupRole: "dependant",
          groupSubscription: {
            groupType: "couple",
            primaryMember: primaryMember._id,
          },
        });
        insertedMembers.push(dependantMember);

        // Update Primary Member's dependantMembers
        primaryMember.groupSubscription.dependantMembers.push({
          member: dependantMember._id,
          status: "active",
          joinedAt: startDate,
        });
        await primaryMember.save();
        nameIndex++;
      }

      // Family Members (9 families = 36 members per branch: 4 active, 5 expired)
      for (let i = 0; i < 9; i++) {
        const isActive = i < 4; // First 4 families are active
        // Primary Member
        const primaryName = nigerianNames[nameIndex % nigerianNames.length];
        const primaryEmail = `${primaryName.firstName.toLowerCase()}.${primaryName.lastName.toLowerCase()}${nameIndex}@example.com`;
        const startDate = generateStartDate(
          isActive,
          expiredMonths[expiredMonthIndex % expiredMonths.length]
        );
        const plan = await Plan.findById(planIds[branch].family);
        const endDate = calculateEndDate(startDate, plan.duration);
        const subscriptionStatus = isActive ? "active" : "expired";
        const primaryMember = await Member.create({
          firstName: primaryName.firstName,
          lastName: primaryName.lastName,
          email: primaryEmail,
          password: hashedPassword,
          phoneNumber: generatePhoneNumber(),
          dateOfBirth: randomDateOfBirth(),
          gender: primaryName.gender,
          address: addresses[branch],
          emergencyContact: {
            fullName: `${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].firstName
            } ${
              nigerianNames[(nameIndex + 1) % nigerianNames.length].lastName
            }`,
            phoneNumber: generatePhoneNumber(),
            relationship: "spouse",
          },
          role: "member",
          isActive: isActive,
          registrationDate: startDate,
          currentSubscription: {
            plan: planIds[branch].family,
            subscriptionStatus,
            startDate,
            endDate,
            autoRenew: false,
            paymentMethod: "card",
            paymentStatus: "approved",
            transactionReference: uuidv4().slice(0, 10),
          },
          membershipHistory: [
            {
              plan: planIds[branch].family,
              startDate,
              endDate,
            },
          ],
          isGroup: true,
          groupRole: "primary",
          groupSubscription: {
            groupType: "family",
            groupMaxMember: 4,
            groupInviteToken: uuidv4(),
            dependantMembers: [],
          },
        });
        insertedMembers.push(primaryMember);
        nameIndex++;
        if (!isActive && i % Math.ceil(5 / membersPerExpiredMonth) === 0)
          expiredMonthIndex++;

        // Three Dependant Members
        for (let j = 0; j < 3; j++) {
          const dependantName = nigerianNames[nameIndex % nigerianNames.length];
          const dependantEmail = `${dependantName.firstName.toLowerCase()}.${dependantName.lastName.toLowerCase()}${nameIndex}@example.com`;
          const dependantMember = await Member.create({
            firstName: dependantName.firstName,
            lastName: dependantName.lastName,
            email: dependantEmail,
            password: hashedPassword,
            phoneNumber: generatePhoneNumber(),
            dateOfBirth: randomDateOfBirth(),
            gender: dependantName.gender,
            address: addresses[branch],
            emergencyContact: {
              fullName: `${primaryName.firstName} ${primaryName.lastName}`,
              phoneNumber: generatePhoneNumber(),
              relationship: j === 0 ? "spouse" : "child",
            },
            role: "member",
            isActive: isActive,
            registrationDate: startDate,
            currentSubscription: {
              plan: planIds[branch].family,
              subscriptionStatus,
              startDate,
              endDate,
              autoRenew: false,
              paymentMethod: "card",
              paymentStatus: "approved",
              transactionReference: uuidv4().slice(0, 10),
            },
            membershipHistory: [
              {
                plan: planIds[branch].family,
                startDate,
                endDate,
              },
            ],
            isGroup: true,
            groupRole: "dependant",
            groupSubscription: {
              groupType: "family",
              primaryMember: primaryMember._id,
            },
          });
          insertedMembers.push(dependantMember);

          // Update Primary Member's dependantMembers
          primaryMember.groupSubscription.dependantMembers.push({
            member: dependantMember._id,
            status: "active",
            joinedAt: startDate,
          });
          await primaryMember.save();
          nameIndex++;
        }
      }
    }

    console.log(`Seeded ${insertedMembers.length} members`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}
