import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const DICTIONARY_ENTRIES: { title: string; description: string }[] = [
  // --- Common knowledge ---
  {
    title: "Oil change interval",
    description:
      "Most motorcycles need an oil change every 3,000–6,000 km or every 3–6 months, whichever comes first. Check your owner's manual. Use the oil type and viscosity specified (e.g. 10W-40).",
  },
  {
    title: "Tire pressure",
    description:
      "Check tire pressure when tires are cold, at least every 2 weeks. Correct pressure is in the manual or on a sticker (often on the swingarm). Under-inflation causes wear and handling issues; over-inflation reduces grip.",
  },
  {
    title: "Chain maintenance",
    description:
      "Clean and lubricate the drive chain every 500–800 km. Keep correct slack (see manual); too tight damages sprockets and bearings, too loose can jump or break. Align rear wheel so both sides match.",
  },
  {
    title: "Brake fluid",
    description:
      "Brake fluid absorbs moisture over time. Replace every 1–2 years or as specified. Use the DOT grade in the manual (e.g. DOT 4). Never reuse old fluid or mix different types.",
  },
  {
    title: "Coolant (liquid-cooled engines)",
    description:
      "Check level when the engine is cold. Replace coolant according to the manual (often every 2–4 years). Use the type specified; mixing types can cause corrosion or clogging.",
  },
  {
    title: "Battery care",
    description:
      "Keep the battery charged; use a maintainer if the bike sits. Check terminals for corrosion and tightness. Most batteries last 2–5 years. If the bike is stored, disconnect or use a trickle charger.",
  },
  {
    title: "Pre-ride check (T-CLOCS)",
    description:
      "Tires (pressure, wear, damage), Controls (cables, levers, throttle), Lights (head, brake, turn, indicators), Oil (level), Chassis (frame, fasteners, chain), Stands (center/side stand). Do a quick check before every ride.",
  },
  {
    title: "Warm-up",
    description:
      "Let the engine run briefly (1–2 minutes) before riding, especially in cold weather. Avoid high revs until oil is circulating. Liquid-cooled bikes warm up faster; don’t leave idling too long.",
  },
  {
    title: "Break-in period",
    description:
      "New engines need a break-in: vary speed and load, avoid sustained high revs or full throttle for the first 500–1000 km. Follow the manual exactly; some makers specify oil change at first service.",
  },
  {
    title: "Fuel quality and octane",
    description:
      "Use the octane rating specified in the manual (e.g. 91 RON). Poor fuel can cause knocking and deposits. Avoid long-term storage with ethanol fuel; use stabilizer if the bike sits.",
  },
  {
    title: "Storage (long-term)",
    description:
      "Stabilize fuel or drain; disconnect battery or use maintainer; inflate tires to spec; cover bike; avoid damp. Some recommend changing oil before storage and running briefly periodically.",
  },
  {
    title: "Wet weather riding",
    description:
      "Reduce speed; avoid painted lines and metal; smooth throttle and brakes; increase following distance. First rain after dry spell is slickest. Consider rain gear and visor treatment.",
  },
  {
    title: "Tire wear and replacement",
    description:
      "Check tread depth; replace before reaching wear bars (often 1 mm). Front and rear can wear at different rates. Age matters: replace if over 5–6 years even with tread left.",
  },
  {
    title: "Headlight and electrical",
    description:
      "Check headlight (low/high), brake light, turn signals, and horn regularly. Clean connectors and grounds if lights dim or flicker. Upgrade to LED only if compatible with flasher/charging.",
  },
  {
    title: "Swingarm",
    description:
      "Rear suspension arm that holds the rear wheel. Pivot bearings need periodic check and grease. Keep axle nut torqued and alignment correct for chain and handling.",
  },
  {
    title: "Wheel bearing",
    description:
      "Bearings in front and rear wheels. Worn bearings cause play, vibration, or noise. Check by lifting wheel and rocking; replace in pairs (inner/outer) when loose or rough.",
  },
  // --- Common parts ---
  {
    title: "Spark plug",
    description:
      "Ignites the air-fuel mixture in the cylinder. Replace at intervals in the manual (e.g. 10,000–20,000 km). Use the heat range and type specified. Symptoms of wear: hard starting, misfire, poor fuel economy.",
  },
  {
    title: "Air filter",
    description:
      "Filters air entering the engine. Clogged filters reduce power and fuel economy. Replace or clean (if reusable) per manual; more often in dusty conditions. Paper filters are usually replaced; foam/washable can be cleaned.",
  },
  {
    title: "Carburetor",
    description:
      "Mixes air and fuel in older bikes. Requires periodic cleaning and tuning. Symptoms of issues: rough idle, hesitation, poor mileage. Many modern bikes use fuel injection instead.",
  },
  {
    title: "Fuel injector",
    description:
      "Sprays fuel into the intake in fuel-injected engines. Keeps fuel system clean with quality fuel; additives can help. Clogged injectors cause misfire, rough idle, or loss of power.",
  },
  {
    title: "Clutch",
    description:
      "Connects engine to transmission; allows smooth take-off and gear changes. Worn clutch: slipping under load, hard to engage. Adjust cable/hydraulic free play per manual. Replace friction plates when worn.",
  },
  {
    title: "Brake pad",
    description:
      "Friction material that presses against the disc (or drum) to slow the bike. Check thickness; replace before metal contacts the disc. Front pads often wear faster than rear.",
  },
  {
    title: "Brake disc (rotor)",
    description:
      "Metal disc the brake pads clamp. Can warp or wear thin; replace if under minimum thickness or heavily scored. Keep clean; avoid touching the surface with bare hands (oil causes poor braking).",
  },
  {
    title: "Drive chain",
    description:
      "Transmits power from gearbox to rear wheel. Consists of links and pins; stretches over time. Replace when adjustment runs out or links are stiff/damaged. Use the size and type in the manual (e.g. 520, 525).",
  },
  {
    title: "Sprocket (front and rear)",
    description:
      "Toothed wheels that work with the chain. Replace as a set with the chain; worn sprockets accelerate chain wear. Check for hooked or cracked teeth.",
  },
  {
    title: "Fork (front suspension)",
    description:
      "Tubes that hold the front wheel and absorb bumps. Seals can leak; oil should be changed per manual. Proper fork oil level and condition affect handling and comfort.",
  },
  {
    title: "Shock absorber (rear)",
    description:
      "Dampens rear wheel movement. Can leak or lose damping. Rebuild or replace when performance drops. Preload and damping often adjustable for load and preference.",
  },
  {
    title: "Valve clearance",
    description:
      "Gap between valve and rocker/cam. Too tight: poor running, risk of damage; too loose: noise, power loss. Check and adjust at intervals in the manual (e.g. every 20,000 km).",
  },
  {
    title: "Battery",
    description:
      "Stores charge for starting and electrical systems. 12V; capacity in Ah. Types: conventional (maintain fluid), AGM, lithium. Keep charged; replace when it no longer holds charge or fails load test.",
  },
  {
    title: "Oil filter",
    description:
      "Removes contaminants from engine oil. Replace at every oil change. Use the correct size and type for your engine. Hand-tighten only; over-tightening can damage the seal.",
  },
  {
    title: "Throttle cable",
    description:
      "Connects twist grip to carburetor or throttle body. Should have a small amount of free play. Replace if frayed, sticky, or broken. Lubricate periodically with cable lube.",
  },
  {
    title: "Clutch cable",
    description:
      "Connects clutch lever to clutch mechanism. Adjust free play per manual; replace if frayed or stiff. Lubricate with cable lube to extend life and smooth operation.",
  },
  {
    title: "Cam chain / timing chain",
    description:
      "Chain (or belt) that drives the camshaft(s) from the crankshaft. Can stretch or wear; tensioners need adjustment or replacement. Rattling at idle often indicates wear or slack.",
  },
  {
    title: "Stator",
    description:
      "Fixed part of the charging system; generates AC when the rotor spins. Failure causes weak or no charging (dim lights, dead battery). Test with multimeter; replace if out of spec.",
  },
  {
    title: "Regulator-rectifier",
    description:
      "Converts AC from the stator to DC and keeps voltage stable. Overcharging or undercharging can point to a faulty reg/rec. Often mounted where it gets airflow; keep connections clean.",
  },
  {
    title: "Brake line (hose)",
    description:
      "Flexible hose from master cylinder or caliper. Rubber lines age and can swell; braided stainless lasts longer and gives firmer feel. Replace if cracked, leaking, or very old.",
  },
  {
    title: "Master cylinder (brake/clutch)",
    description:
      "Pump that turns lever pressure into hydraulic force. Keep fluid clean and level correct; rebuild or replace if leaking or lever feels spongy after bleeding.",
  },
  {
    title: "Caliper (brake)",
    description:
      "Holds brake pads and squeezes them against the disc. Pistons and seals can stick or leak. Clean and lubricate slider pins; rebuild or replace caliper if pistons don’t retract or fluid leaks.",
  },
  {
    title: "Radiator",
    description:
      "Cools engine coolant in liquid-cooled bikes. Keep fins clean (bugs, mud); check for leaks and secure hoses. Replace cap if it doesn’t hold pressure.",
  },
  {
    title: "Thermostat",
    description:
      "Opens to allow coolant flow when engine is warm. Stuck closed causes overheating; stuck open slows warm-up. Replace at intervals in the manual or if temperature acts wrong.",
  },
  {
    title: "Alternator / generator",
    description:
      "Charges the battery and powers lights and ignition. On bikes usually a stator plus rotor; failure means no charge. Test charging voltage (about 13.5–14.5 V at mid revs).",
  },
  {
    title: "Starter motor",
    description:
      "Electric motor that spins the engine for starting. Click with no crank often means battery or solenoid; slow crank suggests weak battery or bad connection. Replace motor if it doesn’t turn or burns out.",
  },
  {
    title: "Gasket",
    description:
      "Seal between two surfaces (e.g. head, cover, exhaust). Replace when opening the engine or if oil/coolant leaks. Use correct torque and sequence when refitting.",
  },
  {
    title: "Exhaust system",
    description:
      "Header(s), mid-pipe, and muffler. Leaks at joints cause noise and can affect tuning. Rust and corrosion shorten life. Aftermarket systems may need jetting or mapping changes.",
  },
  {
    title: "O-ring",
    description:
      "Rubber ring that seals between parts (e.g. oil filter cap, coolant hoses). Replace when worn, flattened, or leaking; use the correct size and material for oil/coolant/fuel.",
  },
  {
    title: "Bearing (general)",
    description:
      "Reduces friction between moving parts (wheels, swingarm, steering, engine). Lubricate or replace when noisy, loose, or stiff. Use the correct type and size; press in properly.",
  },
  {
    title: "Gearbox",
    description:
      "Transmission that selects gear ratios. Oil is often shared with engine; use the grade in the manual. Clunking, jumping out of gear, or difficulty shifting can indicate wear or adjustment.",
  },
  {
    title: "Drive belt",
    description:
      "Alternative to chain on some bikes; low maintenance, quiet. Check tension and condition; replace at recommended interval or if cracked or damaged. Keep away from oil.",
  },
  {
    title: "Idle speed screw / adjustment",
    description:
      "Sets engine idle RPM. Adjust when engine is warm; too low causes stall, too high wastes fuel and can make gear engagement harsh. On fuel-injected bikes often set via diagnostic tool.",
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";

  const passwordHash = await hash(adminPassword, 12);

  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash, role: "ADMIN" },
    });
    console.log("Updated existing admin user:", adminEmail);
  } else {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Admin",
        role: "ADMIN",
      },
    });
    console.log("Created admin user:", adminEmail);
  }

  const adminId = admin!.id;

  await prisma.dictionaryEntry.deleteMany({
    where: { userId: adminId },
  });
  console.log("Cleared existing dictionary entries for admin.");

  await prisma.dictionaryEntry.createMany({
    data: DICTIONARY_ENTRIES.map((e) => ({
      userId: adminId,
      title: e.title,
      description: e.description,
    })),
  });
  console.log(`Seeded ${DICTIONARY_ENTRIES.length} dictionary entries (common knowledge + motorcycle parts).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
