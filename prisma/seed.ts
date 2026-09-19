import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VERIFIED = "2026-09-19";

async function main() {
  await prisma.coverageProgram.deleteMany();

  await prisma.coverageProgram.createMany({
    data: [
      {
        manufacturer: "HYUNDAI",
        vehicleModels:
          "Santa Fe|Tucson|Sonata Hybrid|Sonata Plug-In Hybrid|Veloster|Elantra|Elantra Coupe|Elantra GT",
        modelYearsStart: 2010,
        modelYearsEnd: 2021,
        engine: "Theta II 2.4L MPI / Nu 2.0L GDI / Gamma 1.6L GDI (program-specific)",
        transmission: null,
        component: "engine",
        failureSymptom: "connecting rod bearing failure, engine damage, stalling",
        programType: "warranty extension",
        programName: "Hyundai TXXM Engine Warranty Extension",
        programNumber: "TXXM",
        eligibilityConditions:
          "Qualified vehicles only. Generally requires Knock Sensor Detection System installation (Campaign 966 or 982) unless exempt under Recall 198 or 209. Commercial, rental, and salvage vehicles are ineligible. Coverage is 15 years or 150,000 miles from original retail delivery or first use, whichever occurs first.",
        mileageLimit: 150000,
        ageYearsLimit: 15,
        vinLimitations: "VIN must be confirmed on Hyundai's TXXM portal. Not all listed model years/engines are covered.",
        requiredDiagnostic:
          "Dealer confirmation that engine damage or malfunction is caused by connecting rod bearing failure; KSDS campaign completion where required.",
        coverageDescription:
          "Hyundai states that for qualified vehicles, powertrain limited warranty coverage for certain engine repairs/replacement caused by connecting rod bearing failure is extended to 15 years or 150,000 miles.",
        reimbursementAvailable: false,
        sourceUrl: "https://autoservice.hyundaiusa.com/TXXM",
        sourceOrganization: "Hyundai Motor America",
        sourcePublicationDate: null,
        lastVerifiedDate: VERIFIED,
        notes:
          "Model list is taken from Hyundai's TXXM page as 'certain' vehicles. Do not treat a year/make/model hit as verified VIN eligibility.",
        confidenceLevel: "high-source / VIN-unconfirmed",
      },
      {
        manufacturer: "HYUNDAI",
        vehicleModels: "Sonata|Santa Fe Sport|Tucson",
        modelYearsStart: 2011,
        modelYearsEnd: 2019,
        engine: "Theta II 2.0L or 2.4L GDI",
        transmission: null,
        component: "engine",
        failureSymptom: "connecting rod bearing wear, engine seizure, stalling, engine fire",
        programType: "settlement / lifetime warranty extension",
        programName: "Hyundai Theta II Engine Settlement Warranty Extension (TXXI)",
        programNumber: "TXXI",
        eligibilityConditions:
          "Class vehicles in In re: Hyundai and Kia Engine Litigation. Lifetime short-block coverage for bearing wear/damage is conditioned on KSDS completion and other settlement terms, including exceptional-neglect exclusions. 2019 vehicles may be limited to those built before KSDS was incorporated in production.",
        mileageLimit: null,
        ageYearsLimit: null,
        vinLimitations: "Confirm class membership and VIN on official settlement/Hyundai campaign tools.",
        requiredDiagnostic:
          "Settlement materials describe KSDS completion and, in dealer guidance, conditions such as DTC P1326 / illuminated check-engine lamp for certain campaign paths.",
        coverageDescription:
          "Court-supervised settlement materials and NHTSA-hosted dealer guidance describe a lifetime warranty extension for the engine short block assembly (block, crankshaft and bearings, connecting rods and bearings, pistons) for qualifying Theta II class vehicles after KSDS, plus possible reimbursement for qualifying past repairs.",
        reimbursementAvailable: true,
        sourceUrl: "https://static.nhtsa.gov/odi/tsbs/2022/MC-10207801-0001.pdf",
        sourceOrganization: "NHTSA (Hyundai manufacturer communication) / C.D. Cal. settlement",
        sourcePublicationDate: "2022",
        lastVerifiedDate: VERIFIED,
        notes:
          "Also referenced at HyundaiThetaEngineSettlement.com in the NHTSA-hosted dealer document. Past-repair claim deadlines may have closed; lifetime warranty terms still require VIN-level confirmation.",
        confidenceLevel: "high-source / eligibility-conditional",
      },
      {
        manufacturer: "KIA",
        vehicleModels: "Optima|Sorento|Sportage",
        modelYearsStart: 2011,
        modelYearsEnd: 2019,
        engine: "Theta II 2.0L or 2.4L GDI",
        transmission: null,
        component: "engine",
        failureSymptom: "engine seizure, stalling, engine failure, engine fire, connecting rod bearing",
        programType: "settlement / lifetime warranty extension",
        programName: "Kia Theta II Engine Settlement Lifetime Short-Block Warranty",
        programNumber: "8:17-cv-00838-JLS-JDE",
        eligibilityConditions:
          "2011–2018 and certain 2019 Optima; 2012–2018 and certain 2019 Sorento; 2011–2018 and certain 2019 Sportage with genuine Theta II 2.0L or 2.4L GDI engines. Lifetime short-block coverage requires Knock Sensor Detection System update. Exceptional neglect and other settlement exclusions apply. Reimbursement claims had a stated deadline of April 12, 2021 unless extended on the settlement site.",
        mileageLimit: null,
        ageYearsLimit: null,
        vinLimitations: "2019 vehicles limited to those manufactured before KSDS was incorporated into production. Confirm VIN on kiaenginesettlement.com or Kia.",
        requiredDiagnostic: "KSDS product-improvement campaign completion for lifetime warranty path.",
        coverageDescription:
          "The official class notice states Kia extended the powertrain warranty to a lifetime warranty for the engine short block assembly upon KSDS completion, and described reimbursement for qualifying past repairs, rental/towing, and other listed benefits.",
        reimbursementAvailable: true,
        sourceUrl: "https://www.kiaenginesettlement.com/Content/Documents/Notice.pdf",
        sourceOrganization: "U.S. District Court, Central District of California / Kia settlement administrator",
        sourcePublicationDate: "2020",
        lastVerifiedDate: VERIFIED,
        notes: "Do not tell a customer that cash-claim deadlines remain open without checking the live settlement site.",
        confidenceLevel: "high-source / eligibility-conditional",
      },
      {
        manufacturer: "KIA",
        vehicleModels: "Soul",
        modelYearsStart: 2012,
        modelYearsEnd: 2016,
        engine: "1.6L GDI",
        transmission: null,
        component: "engine",
        failureSymptom: "connecting rod bearing wear, engine damage, engine failure",
        programType: "warranty extension / product improvement campaign",
        programName: "Kia Soul 1.6L GDI KSDS Engine Warranty Extension",
        programNumber: null,
        eligibilityConditions:
          "2012–2016 Soul with 1.6L GDI. Warranty extension for engine long-block repairs needed due to connecting rod bearing damage is 15 years / 150,000 miles from first service, only if the KSDS software update is installed.",
        mileageLimit: 150000,
        ageYearsLimit: 15,
        vinLimitations: "Owner letter is VIN-specific. Confirm campaign completion in Kia records.",
        requiredDiagnostic: "KSDS ECU software update at an authorized Kia dealer.",
        coverageDescription:
          "NHTSA-hosted Kia owner communication states that after the free KSDS ECU update, Kia will warrant engine long-block assembly repairs needed due to connecting rod bearing damage for 15 years/150,000 miles.",
        reimbursementAvailable: false,
        sourceUrl: "https://static.nhtsa.gov/odi/tsbs/2021/MC-10201610-0001.pdf",
        sourceOrganization: "NHTSA (Kia manufacturer communication)",
        sourcePublicationDate: "2021-04-06",
        lastVerifiedDate: VERIFIED,
        notes: "A later Kia KSDS renotification exists for other models/engines; this row is limited to the Soul letter we verified.",
        confidenceLevel: "high-source / VIN-unconfirmed",
      },
      {
        manufacturer: "NISSAN",
        vehicleModels: "Versa|Versa Note|Sentra|Altima|Juke",
        modelYearsStart: 2012,
        modelYearsEnd: 2017,
        engine: null,
        transmission: "CVT",
        component: "transmission",
        failureSymptom: "CVT failure, shudder, slipping, delayed engagement",
        programType: "warranty extension",
        programName: "Nissan CVT Warranty Extension (84 months / 84,000 miles)",
        programNumber: null,
        eligibilityConditions:
          "Bulletin lists 2012–2017 Versa Sedan (N17), 2014–2017 Versa Note (E12), 2013–2017 Sentra (B17), 2013–2016 Altima (L33), and 2013–2017 Juke (F15), each with specific manufacture-date windows. Extension is from 60 months/60,000 miles to 84 months/84,000 miles, whichever occurs first, for the CVT assembly and listed internal components, valve body, torque converter, cooler kit if applicable, and TCM reprogramming. Rental during covered CVT repairs is included. Other models and NV200/Taxi are called out as not in this extension.",
        mileageLimit: 84000,
        ageYearsLimit: 7,
        vinLimitations: "Manufacture-date windows in the bulletin must be checked. Pathfinder/Infiniti JX35/QX60 had a separate prior extension.",
        requiredDiagnostic: "Dealer diagnosis that the needed repair is within the listed CVT components.",
        coverageDescription:
          "Nissan manufacturer communication filed with NHTSA extends CVT coverage to 84 months/84,000 miles on the listed vehicles, including specified internal parts and rental during covered repairs.",
        reimbursementAvailable: false,
        sourceUrl: "https://static.nhtsa.gov/odi/tsbs/2020/MC-10176204-0001.pdf",
        sourceOrganization: "NHTSA (Nissan manufacturer communication)",
        sourcePublicationDate: "2020",
        lastVerifiedDate: VERIFIED,
        notes:
          "This is a time/mileage warranty extension, not a finding that a current high-mile failure is covered. Confirm the vehicle is still inside 84/84 and the manufacture dates.",
        confidenceLevel: "high-source / time-mileage-limited",
      },
      {
        manufacturer: "TOYOTA",
        vehicleModels: "Prius|Camry|RAV4|Highlander|Corolla|Avalon|Venza|Sienna|Tacoma|Tundra|4Runner|Crown|bZ4X|Mirai",
        modelYearsStart: 2020,
        modelYearsEnd: 2026,
        engine: "hybrid / plug-in hybrid / fuel cell (HV battery)",
        transmission: null,
        component: "hybrid battery",
        failureSymptom: "hybrid battery failure, loss of hybrid assist, HV battery replacement",
        programType: "new-vehicle limited warranty",
        programName: "Toyota Hybrid Battery Warranty (MY2020+ 10 years / 150,000 miles)",
        programNumber: null,
        eligibilityConditions:
          "Toyota announced that starting with model year 2020, hybrid battery warranty increased to 10 years from date of first use or 150,000 miles, whichever comes first, for new MY2020 Toyota hybrid, plug-in hybrid, and fuel cell vehicles. Other hybrid components remain on the hybrid system warranty (8 years/100,000 miles in the announcement). Terms of the New Vehicle Limited Warranty and the vehicle's Warranty & Maintenance Guide control.",
        mileageLimit: 150000,
        ageYearsLimit: 10,
        vinLimitations: "Applies to MY2020 and newer as stated by Toyota; confirm the specific vehicle's warranty booklet. Older hybrids may have different federal vs. CARB/emissions battery coverage.",
        requiredDiagnostic: "Dealer diagnosis that the HV battery itself requires warrantable repair.",
        coverageDescription:
          "Toyota's owner warranty page and 2019 newsroom announcement state MY2020+ hybrid batteries are covered 10 years/150,000 miles. This is ordinary warranty coverage, not a special campaign, and only applies if the vehicle is still within that term.",
        reimbursementAvailable: false,
        sourceUrl: "https://www.toyota.com/owners/warranty-owners-manuals/",
        sourceOrganization: "Toyota Motor Sales, U.S.A.",
        sourcePublicationDate: "2019-10-10",
        lastVerifiedDate: VERIFIED,
        notes:
          "Supporting announcement: https://pressroom.toyota.com/toyota-extends-battery-warranty-for-model-year-2020-hybrid-plug-in-and-fuel-cell-electric-vehicles/",
        confidenceLevel: "high-source / standard-warranty",
      },
      {
        manufacturer: "MULTIPLE",
        vehicleModels: "multiple",
        modelYearsStart: 2000,
        modelYearsEnd: 2019,
        engine: null,
        transmission: null,
        component: "airbags",
        failureSymptom: "Takata inflator rupture, airbag recall",
        programType: "safety recall",
        programName: "Takata Airbag Inflator Recalls",
        programNumber: "Takata",
        eligibilityConditions:
          "VIN-specific. Many automakers issued recalls for Takata airbag inflators. Remedy is performed at no charge by the recalling manufacturer when the VIN is affected and parts are available. Some unrepaired vehicles have been the subject of NHTSA do-not-drive warnings.",
        mileageLimit: null,
        ageYearsLimit: null,
        vinLimitations: "Must be checked by VIN on NHTSA or the vehicle manufacturer recall site. Year/make/model alone is not enough.",
        requiredDiagnostic: "VIN recall lookup; dealer performs the recall remedy.",
        coverageDescription:
          "NHTSA's Takata recall spotlight documents a multi-manufacturer inflator recall. If a VIN is affected, the recalling manufacturer is responsible for the recall remedy. This is not a general finding that any airbag repair on any estimate is a free recall.",
        reimbursementAvailable: false,
        sourceUrl: "https://www.nhtsa.gov/equipment/takata-recall-spotlight",
        sourceOrganization: "NHTSA",
        sourcePublicationDate: null,
        lastVerifiedDate: VERIFIED,
        notes: "Always pair with a live NHTSA VIN/year-make-model recall search before talking to a customer about Takata.",
        confidenceLevel: "high-source / VIN-required",
      },
    ],
  });
}

main()
  .then(async () => {
    const count = await prisma.coverageProgram.count();
    console.log(`Seeded ${count} coverage programs.`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
