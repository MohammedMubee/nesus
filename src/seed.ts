import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './config/db.js';
import {
  User,
  Company,
  Contact,
  Lead,
  Deal,
  Quote,
  Task,
  Ticket,
  Activity
} from './models/index.js';
import {
  Role,
  LifecycleStage,
  LeadStatus,
  DealStage,
  QuoteStatus,
  TicketPriority,
  TicketStatus,
  ActivityType
} from './types/index.js';
import { logger } from './utils/logger.js';

async function seed() {
  await connectDB();
  logger.info('🌱 Starting NexusCRM Database Seeding with Real Excel/CSV Data...');

  // 1. Clean old collections in reverse dependency order
  await Activity.deleteMany({});
  await Ticket.deleteMany({});
  await Task.deleteMany({});
  await Quote.deleteMany({});
  await Deal.deleteMany({});
  await Contact.deleteMany({});
  await Company.deleteMany({});
  await Lead.deleteMany({});
  await User.deleteMany({});

  logger.info('🧹 Cleaned existing MongoDB database collections.');

  // 2. Seed Default Admin & Sales Rep Users
  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);
  const adminUser = await User.create({
    name: 'Mr. VP',
    email: 'admin@nexuscrm.com',
    password: defaultPasswordHash,
    role: Role.ADMIN
  });

  const repUser = await User.create({
    name: 'Mr. Thameem',
    email: 'thameem@nexuscrm.com',
    password: defaultPasswordHash,
    role: Role.SALES_REP
  });

  logger.info(`👤 Seeded core users: ${adminUser.email}, ${repUser.email}`);

  // 3. Seed Companies from Client/Account Master & Deals
  const companyDataList = [
    { name: 'Necco Tools', industry: 'Precision Engineering & Tooling', website: 'https://neccotools.com' },
    { name: 'PIP / SIGMA', industry: 'Industrial Manufacturing', website: 'https://pip-sigma.com' },
    { name: 'Chennai CNC', industry: 'CNC Machining & Automation', website: 'https://chennaicnc.com' },
    { name: 'Tecknoweld Perungudi', industry: 'Welding & Heavy Engineering', website: 'https://tecknoweld.com' },
    { name: 'Tecknoweld Oragadam', industry: 'Welding & Industrial Plant', website: 'https://tecknoweld.com' },
    { name: 'GGPL', industry: 'Industrial Fabrication', website: 'https://ggpl-group.com' },
    { name: 'Seiko Maraica', industry: 'Precision Manufacturing', website: 'https://seikomaraica.com' },
    { name: 'Ashwin Forging', industry: 'Automotive Forging & Castings', website: 'https://ashwinforging.com' },
    { name: 'RDES', industry: 'Design & Engineering Services', website: 'https://rdes.in' },
    { name: 'Srinar Electronics', industry: 'Electronics & Embedded Systems', website: 'https://srinarelectronics.com' },
    { name: 'Chirakkal Automotive', industry: 'Automotive Components', website: 'https://chirakkalauto.com' },
    { name: 'Seco Komos Pune/Chennai', industry: 'Automotive Plastics & Parts', website: 'https://secokomos.com' },
    { name: 'Shiva Enterprises', industry: 'Industrial Supply & Parts', website: 'https://shivaenterprises.in' },
    { name: 'Aarthi Rubbers', industry: 'Rubber Molding & Seals', website: 'https://aarthirubbers.com' },
    { name: 'Youngshin-QMS', industry: 'Automotive Quality Systems', website: 'https://youngshin.com' },
    { name: 'CYMYTECH', industry: 'Precision Technology Solutions', website: 'https://cymytech.com' },
    { name: 'Reify Engineering Ltd', industry: 'Process Engineering & Plants', website: 'https://reifyengineering.com' },
    { name: 'Om Spectrum Financial', industry: 'Financial & Accounting Systems', website: 'https://omspectrum.com' },
    { name: 'Mobase Electronics Pvt Ltd', industry: 'Automotive Electronics', website: 'https://mobase.co.kr' },
    { name: 'Shreem Enterprise', industry: 'Commercial Distribution', website: 'https://shreementerprise.com' },
    { name: 'Phirivas Rivvit Ecom', industry: 'Fasteners & E-Commerce', website: 'https://phirivas-rivvit.com' },
    { name: 'Annai Enterprises', industry: 'Manufacturing & Tools', website: 'https://annaienterprises.in' },
    { name: 'Umaa Engineers', industry: 'Plant Equipment & Instrumentation', website: 'https://umaaengineers.com' },
    { name: 'TMTE Denrack', industry: 'Automotive Assemblies', website: 'https://tmtedenrack.com' },
    { name: 'Kaanra Technology Inc', industry: 'Technology & Enterprise IT', website: 'https://kaanratech.com' },
    { name: 'Cross Manufacturing Company', industry: 'Industrial Machinery', website: 'https://crossmfg.com' },
    { name: 'Vipras Adz', industry: 'Media & Digital Branding', website: 'https://viprasadz.com' },
    { name: 'Clastek Engineering Ltd', industry: 'Industrial Engineering', website: 'https://clastek.com' },
    { name: 'Modern General Industry', industry: 'General Manufacturing & ERP', website: 'https://moderngeneral.in' },
    { name: 'Five Star', industry: 'Consumer & Commercial Supplies', website: 'https://fivestarproducts.in' },
    { name: 'Teknovate Plastics Pvt Ltd', industry: 'Injection Molding & Polymers', website: 'https://teknovateplastics.com' },
    { name: 'Excel Optics P Ltd', industry: 'Optical & Precision Lenses', website: 'https://exceloptics.com' },
    { name: 'CKB Preciway Engineering', industry: 'Precision Tooling', website: 'https://ckbpreciway.com' },
    { name: 'Mercury Precision', industry: 'Aerospace & Precision Machining', website: 'https://mercuryprecision.com' },
    { name: 'Maraica Industries', industry: 'Heavy Fabrication', website: 'https://maraica.com' },
    { name: 'Rambal', industry: 'Automotive Components', website: 'https://rambal.com' },
    { name: 'Padma Mines', industry: 'Mining & Mineral Processing', website: 'https://padmamines.com' },
    { name: 'Youngshin Automotive India P Ltd', industry: 'Automotive Systems', website: 'https://youngshin.com' },
    { name: 'Rialto Enterprises Pvt Ltd', industry: 'Enterprise Equipment & Dashboards', website: 'https://rialtoenterprises.com' },
    { name: 'ATV Precision Components Pvt Ltd', industry: 'Precision Auto Turning', website: 'https://atvprecision.com' },
    { name: 'The Zigma Technologies India Pvt Ltd', industry: 'Waste Management & Smart Tech', website: 'https://zigma.in' },
    { name: 'SP Industries', industry: 'Industrial Parts & Tooling', website: 'https://spindustries.in' },
    { name: 'IRP', industry: 'Rubber Products', website: 'https://irprubber.com' },
    { name: 'Goodrich Gasket India Pvt Ltd', industry: 'Seals & Gaskets', website: 'https://goodrichgasket.com' },
    { name: 'PVG Indotech Pvt Ltd', industry: 'Heavy Machinery & Automation', website: 'https://pvgindotech.com' },
    { name: 'Endotherum Fluids', industry: 'Industrial Fluids & Machine Integration', website: 'https://endotherum.com' },
    { name: 'Phirivas Industrial Products', industry: 'Fasteners & Cold Heading', website: 'https://phirivas.com' },
    { name: 'Biojenik Engineering', industry: 'Pharma & Biotech Equipment', website: 'https://biojenik.com' },
    { name: 'Ra Tech Engineers', industry: 'Industrial Automation & ERP', website: 'https://ratech.in' },
    { name: 'Axon Technologies', industry: 'IT & ERP Solutions', website: 'https://axontech.com' },
    { name: 'Delight Industries', industry: 'Precision Fabrication', website: 'https://delightindustries.in' },
    { name: 'Komos Automotive India Pvt Ltd', industry: 'Automotive QMS & SPC', website: 'https://komosauto.com' },
    { name: 'KPR Tubes LLP', industry: 'Tubes & Heavy Metallurgy', website: 'https://kprtubes.com' },
    { name: 'Rivit India Fasteners Pvt Ltd', industry: 'Fasteners & Rivets', website: 'https://rivitfasteners.in' },
    { name: 'SAAJ Steel Corporation', industry: 'Steel & Metallurgy', website: 'https://saajsteel.com' },
    { name: 'IHD Industries Pvt Ltd', industry: 'Online SPC & Industrial Sensors', website: 'https://ihdindustries.com' },
    { name: 'CY MYUTEC Anand Pvt Ltd', industry: 'Automotive Synchronizers', website: 'https://cymyutecanand.com' },
    { name: 'Vigneshwara Engineering', industry: 'Automotive Assemblies', website: 'https://vigneshwaraeng.com' },
    { name: 'Kwangsung Sandhar Automotive Systems', industry: 'Automotive Door Latch Systems', website: 'https://kwangsungsandhar.com' },
    { name: 'Flosil - Bet Coating Pvt Ltd', industry: 'Anti-Corrosion Surface Coatings', website: 'https://flosilcoatings.com' },
    { name: 'Krishna Industrial Services', industry: 'Industrial Operations', website: 'https://krishnaindustrial.com' },
    { name: 'Monsan Tech India Pvt Ltd', industry: 'Precision Machining', website: 'https://monsantech.com' },
    { name: 'HCT Sun India Pvt Ltd', industry: 'Supply Chain & Warehousing', website: 'https://hctsun.com' },
    { name: 'Shiv Machine Tools', industry: 'Machine Tool Manufacturing', website: 'https://shivmachinetools.com' },
    { name: 'Reo Windows', industry: 'Aluminum Windows & Hardware', website: 'https://reowindows.com' },
    { name: 'Sasco Engineering Pvt Ltd', industry: 'Barcode & Traceability Systems', website: 'https://sascoeng.com' },
    { name: 'Saktidhara Textiles', industry: 'Textile Mills & Spinning', website: 'https://saktidharatextiles.com' },
    { name: 'Manto Engg Pvt Ltd', industry: 'Industrial ERP & BI Systems', website: 'https://mantoeng.com' },
    { name: 'Prime Engineering Works', industry: 'Machining & Fabrication', website: 'https://primeeng.com' },
    { name: 'Aster Healthcare Group', industry: 'Healthcare & Hospital Management', website: 'https://asterhealthcare.org' },
    { name: 'Everest Retail Chain', industry: 'Multi-Store Retail & POS', website: 'https://everestretail.com' }
  ];

  const createdCompanies = await Company.create(companyDataList);
  logger.info(`🏢 Seeded ${createdCompanies.length} Companies from Account Master & Pipeline.`);

  // Create lookup map by company name lowercase
  const companyMap = new Map<string, any>();
  createdCompanies.forEach((c) => {
    companyMap.set(c.name.toLowerCase().trim(), c);
  });

  const getCompanyId = (name: string) => {
    if (!name) return null;
    const clean = name.toLowerCase().trim();
    for (const [key, comp] of companyMap.entries()) {
      if (clean.includes(key) || key.includes(clean)) {
        return comp._id;
      }
    }
    return createdCompanies[0]._id;
  };

  // 4. Seed Contacts
  const contactDataList = [
    {
      name: 'Mr. VP',
      title: 'Vice President & Commercial Head',
      department: 'Executive Management',
      email: 'vp.management@endotherum.com',
      phone: '+91 98401 23450',
      lifecycleStage: LifecycleStage.CUSTOMER,
      companyId: getCompanyId('Endotherum Fluids')
    },
    {
      name: 'Mr. Balaganesh (BG)',
      title: 'Technical Director & ERP Lead',
      department: 'Technology Solutions',
      email: 'balaganesh.bg@biojenik.com',
      phone: '+91 98402 34561',
      lifecycleStage: LifecycleStage.SALES_QUALIFIED,
      companyId: getCompanyId('Biojenik Engineering')
    },
    {
      name: 'Mr. Thameem',
      title: 'Solutions Architect & BI Lead',
      department: 'Systems Engineering',
      email: 'thameem@umaaengineers.com',
      phone: '+91 98403 45672',
      lifecycleStage: LifecycleStage.CUSTOMER,
      companyId: getCompanyId('Umaa Engineers')
    },
    {
      name: 'Manikandan',
      title: 'Managing Director',
      department: 'Executive Leadership',
      email: 'manikandan@mantoeng.com',
      phone: '+91 98404 56783',
      lifecycleStage: LifecycleStage.SALES_QUALIFIED,
      companyId: getCompanyId('Manto Engg Pvt Ltd')
    },
    {
      name: 'Mrs. Priya',
      title: 'Head of Commercial Proposals',
      department: 'Finance & Contracts',
      email: 'priya.commercial@umaaengineers.com',
      phone: '+91 98405 67894',
      lifecycleStage: LifecycleStage.CHAMPION,
      companyId: getCompanyId('Umaa Engineers')
    },
    {
      name: 'Mr. Prathap',
      title: 'Digital Systems & IT Auditor',
      department: 'Information Technology',
      email: 'prathap.systems@zigma.in',
      phone: '+91 98406 78905',
      lifecycleStage: LifecycleStage.CHAMPION,
      companyId: getCompanyId('The Zigma Technologies')
    },
    {
      name: 'Suresh',
      title: 'Project Director',
      department: 'Operations & B2B Portal',
      email: 'suresh@phirivas.com',
      phone: '+91 98407 89016',
      lifecycleStage: LifecycleStage.CUSTOMER,
      companyId: getCompanyId('Phirivas Rivvit Ecom')
    },
    {
      name: 'N. Joshi',
      title: 'Works & Operations Manager',
      department: 'Plant Operations',
      email: 'n.joshi@primeeng.com',
      phone: '+91 98408 90127',
      lifecycleStage: LifecycleStage.CUSTOMER,
      companyId: getCompanyId('Prime Engineering Works')
    },
    {
      name: 'Dr. S. Rao',
      title: 'Chief Medical Administrator',
      department: 'Hospital Administration',
      email: 's.rao@asterhealthcare.org',
      phone: '+91 98409 01238',
      lifecycleStage: LifecycleStage.CUSTOMER,
      companyId: getCompanyId('Aster Healthcare Group')
    },
    {
      name: 'T. Shah',
      title: 'Supply Chain & POS Director',
      department: 'Enterprise Retail',
      email: 't.shah@everestretail.com',
      phone: '+91 98410 12349',
      lifecycleStage: LifecycleStage.CUSTOMER,
      companyId: getCompanyId('Everest Retail Chain')
    },
    {
      name: 'Veeramani',
      title: 'Plant Operations Head',
      department: 'Operations',
      email: 'veeramani@acvpl.com',
      phone: '+91 98411 23451',
      lifecycleStage: LifecycleStage.SALES_QUALIFIED,
      companyId: getCompanyId('Necco Tools')
    },
    {
      name: 'Sridhar',
      title: 'Chief Financial Auditor',
      department: 'Auditing & Compliance',
      email: 'sridhar.audit@maceaudit.com',
      phone: '+91 98412 34562',
      lifecycleStage: LifecycleStage.SALES_QUALIFIED,
      companyId: getCompanyId('PIP / SIGMA')
    }
  ];

  const createdContacts = await Contact.create(contactDataList);
  logger.info(`👥 Seeded ${createdContacts.length} Contacts.`);

  // 5. Seed Real Leads from LEADS & CONTACTS Sheet
  const leadsDataList = [
    { name: 'Endotherum Fluids Lead', email: 'vp@endotherum.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'VP Operations', companyName: 'Endotherum Fluids' },
    { name: 'SP Engineering Team', email: 'contact@spengineering.in', source: 'Existing Contact', status: LeadStatus.QUALIFIED, title: 'Managing Director', companyName: 'SP Engineering' },
    { name: 'Accurate Spring Contact', email: 'sales@accuratespring.com', source: 'Existing Contact', status: LeadStatus.QUALIFIED, title: 'Plant Head', companyName: 'Accurate Spring' },
    { name: 'Modern General Industry Contact', email: 'info@moderngeneral.in', source: 'Partner', status: LeadStatus.QUALIFIED, title: 'General Manager', companyName: 'Modern General Industry' },
    { name: 'Food App CloudKitchen Operations', email: 'orders@cloudkitchen.app', source: 'Direct', status: LeadStatus.NEW, title: 'Operations Lead', companyName: 'Food App for CloudKitchen' },
    { name: 'Maraica Industry Lead', email: 'contact@maraica.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'ERP Lead', companyName: 'Maraica Industry' },
    { name: 'Aravind Polymers Lead', email: 'info@aravindpolymers.com', source: 'Referral', status: LeadStatus.NEW, title: 'Director', companyName: 'Aravind Polymers' },
    { name: 'Vaigai Engineering Team', email: 'info@vaigaieng.com', source: 'Existing client', status: LeadStatus.QUALIFIED, title: 'Operations Manager', companyName: 'Vaigai Engineering' },
    { name: 'Nagercoil Aryas Lead', email: 'aryas@nagercoil.com', source: 'Referral', status: LeadStatus.NEW, title: 'General Manager', companyName: 'Nagercoil Aryas' },
    { name: 'Garment Industry Inbound', email: 'lead@garmentindustry.in', source: 'Referral', status: LeadStatus.NEW, title: 'Procurement Manager', companyName: 'Garment Industry' },
    { name: 'Portal Development Auditor', email: 'auditor@portaldev.com', source: 'Referral', status: LeadStatus.NEW, title: 'Lead Auditor', companyName: 'Portal Development Auditor' },
    { name: 'MRP Auto Hub Rubber Contact', email: 'contact@mrpautohub.com', source: 'Direct', status: LeadStatus.NEW, title: 'Plant Supervisor', companyName: 'MRP Auto Hub Rubber' },
    { name: 'STS Hosur Inbound', email: 'info@stshosur.com', source: 'Direct', status: LeadStatus.NEW, title: 'Engineering Head', companyName: 'STS Hosur' },
    { name: 'Kumar Industries Lead', email: 'contact@kumarindustries.com', source: 'Direct', status: LeadStatus.NEW, title: 'Works Manager', companyName: 'Kumar Industries' },
    { name: 'Stam Digital Team', email: 'info@stamdigital.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Digital Transformation Lead', companyName: 'Stam Digital' },
    { name: 'Jey Jey Fabricators Contact', email: 'info@jeyjeyfab.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Managing Partner', companyName: 'Jey Jey Fabricators' },
    { name: 'Prabha Auto Lead', email: 'contact@prabhaauto.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Procurement Specialist', companyName: 'Prabha Auto' },
    { name: 'Shelton Operations', email: 'info@shelton.in', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Operations Lead', companyName: 'Shelton' },
    { name: 'Mercury Precision Team', email: 'precision@mercury.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'US Meeting Coordinator', companyName: 'Mercury Precision' },
    { name: 'Prime Tech Inbound', email: 'contact@primetech.in', source: 'Direct', status: LeadStatus.NEW, title: 'Technical Lead', companyName: 'Prime Tech' },
    { name: 'SGO Representative', email: 'info@sgo.in', source: 'Direct', status: LeadStatus.NEW, title: 'Executive Manager', companyName: 'SGO' },
    { name: 'UNI Product Contact', email: 'contact@uniproduct.in', source: 'Direct', status: LeadStatus.NEW, title: 'Commercial Head', companyName: 'UNI Product' },
    { name: 'Maha Engineering Lead', email: 'info@mahaengineering.in', source: 'Direct', status: LeadStatus.NEW, title: 'SP Engg Group Coordinator', companyName: 'Maha Engineering' },
    { name: 'Amtex Engineering Team', email: 'contact@amtexeng.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Green Module Coordinator', companyName: 'Amtex Engineering' },
    { name: 'Mace Audit Sridhar Contact', email: 'sridhar@maceaudit.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Audit Executive', companyName: 'Mace Audit Sridhar' },
    { name: 'Sakthidharar Mills Direct Lead', email: 'info@sakthidharar.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Mills Managing Director', companyName: 'Sakthidharar Mills' },
    { name: 'Dural India Operations', email: 'contact@duralindia.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Direct Meet Coordinator', companyName: 'Dural India' },
    { name: 'Ex-Ashok Leyland DGM', email: 'dgm.leyland@gmail.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Deputy General Manager', companyName: 'Ex-Ashok Leyland DGM' },
    { name: 'Hyundai Transis Andhra Lead', email: 'procurement@hyundaitransis.in', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Online Meeting Lead', companyName: 'Hyundai Transis Andhra' },
    { name: 'Sys Mac Engineers Contact', email: 'info@sysmacengineers.com', source: 'Direct', status: LeadStatus.NEW, title: 'Lead Engineer', companyName: 'Sys Mac Engineers' },
    { name: 'Seco Komos QMS Inbound', email: 'qms@secokomos.com', source: 'Existing client', status: LeadStatus.NEW, title: 'QMS Project Head', companyName: 'Seco Komos' },
    { name: 'CYMY Tech Web Req', email: 'qms@cymytech.com', source: 'Existing client', status: LeadStatus.NEW, title: 'Web App Specialist', companyName: 'CYMY Tech' },
    { name: 'Jana Engineering Industries', email: 'dashboard@janaeng.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Dashboard Coordinator', companyName: 'Jana Engineering Industries' },
    { name: 'Delight Industries Followup', email: 'info@delightindustries.in', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Accounts & ERP Lead', companyName: 'Delight Industries' },
    { name: 'Reo Windows Automation Lead', email: 'orders@reowindows.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Machine Automation Lead', companyName: 'Reo Windows' },
    { name: 'Besmak Engineers IIOT', email: 'iiot@besmak.com', source: 'Direct', status: LeadStatus.NEW, title: 'BI Dashboard Head', companyName: 'Besmak Engineers' },
    { name: 'Laya Tech Representative', email: 'info@layatech.in', source: 'Direct', status: LeadStatus.NEW, title: 'General Inbound', companyName: 'Laya Tech' },
    { name: 'Chennai CNC Project Team', email: 'contact@chennaicnc.com', source: 'Existing client', status: LeadStatus.QUALIFIED, title: 'CNC Automation Lead', companyName: 'Chennai CNC' },
    { name: 'KKR Auto Comp Inbound', email: 'info@kkrauto.com', source: 'Direct', status: LeadStatus.NEW, title: 'Component Engineer', companyName: 'KKR Auto Comp' },
    { name: '4M for CYMYUTEC Lead', email: '4m@cymyutec.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: '4M Change Manager', companyName: '4M for CYMYUTEC' },
    { name: 'Global TVS Automotive Contact', email: 'lead@globaltvs.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Commercial Manager', companyName: 'Global TVS' },
    { name: 'Sakthi Auto Liaison', email: 'info@sakthiauto.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'LMS Module Specialist', companyName: 'Sakthi Auto' },
    { name: 'Roots Industries Contact', email: 'contact@rootsindustries.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Engineering Director', companyName: 'Roots Industries' },
    { name: 'ACVPL Technical Contact', email: 'veeramani@acvpl.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Automation Head', companyName: 'ACVPL' },
    { name: 'Raa Tech Automation Inbound', email: 'automation@raatech.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'Automation Engineer', companyName: 'Raa tech' },
    { name: 'Mass Auto Components Team', email: 'sales@massauto.com', source: 'Direct', status: LeadStatus.NEW, title: 'Sales Coordinator', companyName: 'Mass Auto Components' },
    { name: 'UE PressTool Inbound', email: 'info@uepresstool.com', source: 'Direct', status: LeadStatus.NEW, title: 'Tooling Supervisor', companyName: 'UE PressTool' },
    { name: 'Manto Engineering Project Lead', email: 'manikandan@mantoeng.com', source: 'Direct', status: LeadStatus.QUALIFIED, title: 'ERP Systems Lead', companyName: 'Manto Engineering' },
    { name: 'Youngshin EDMS Req', email: 'edms@youngshin.com', source: 'Existing client', status: LeadStatus.NEW, title: 'EDMS Specialist', companyName: 'Youngshin New req EDMS' },
    { name: 'Komos EOL Inspection', email: 'eol@komos.com', source: 'Existing client', status: LeadStatus.NEW, title: 'EOL Inspection Lead', companyName: 'Komos EOL Inspection' },
    { name: 'Seiko Maraica Training Module', email: 'training@seikomaraica.com', source: 'Existing client', status: LeadStatus.NEW, title: 'Training Coordinator', companyName: 'Seiko Maraica Training Module' },
    { name: 'Ozone Engineering Solutions', email: 'info@ozoneengineering.com', source: 'Direct', status: LeadStatus.NEW, title: 'Engineering Lead', companyName: 'Ozone Engineering Solutions' },
    { name: 'Think Big Press Tool', email: 'contact@thinkbigtool.com', source: 'Direct', status: LeadStatus.NEW, title: 'Press Tool Specialist', companyName: 'Think Big Press Tool' }
  ];

  const createdLeads = await Lead.create(leadsDataList);
  logger.info(`🎯 Seeded ${createdLeads.length} Leads from Excel sheet.`);

  // 6. Seed Deals from SALES PIPELINE Sheet (Values in ₹)
  const defaultContactId = createdContacts[0]._id;
  const thameemContactId = createdContacts[2]._id;
  const manikandanContactId = createdContacts[3]._id;
  const balaganeshContactId = createdContacts[1]._id;

  const dealsDataList = [
    { title: 'Biojenik Engineering - ERP Software (Green Module, Payroll)', value: 1200000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Biojenik Engineering'), contactId: balaganeshContactId, expectedCloseDate: new Date('2026-11-30') },
    { title: 'Ra Tech Engineers - Ismart ERP (Green Module)', value: 800000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Ra Tech Engineers'), contactId: balaganeshContactId, expectedCloseDate: new Date('2026-12-15') },
    { title: 'Axon Technologies - Green Module', value: 750000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Axon Technologies'), contactId: balaganeshContactId, expectedCloseDate: new Date('2026-12-20') },
    { title: 'Phirivas-Rivvit - Enterprise Implementation', value: 2250000, stage: DealStage.WON, companyId: getCompanyId('Phirivas Industrial Products'), contactId: defaultContactId, expectedCloseDate: new Date('2026-07-11') },
    { title: 'Delight Industries - ERP Software (Green Module & Payroll)', value: 150000, stage: DealStage.NEW, companyId: getCompanyId('Delight Industries'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-05') },
    { title: 'Umaa Engineering - Dashboard Requirement', value: 250000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Umaa Engineers'), contactId: thameemContactId, expectedCloseDate: new Date('2026-11-25') },
    { title: 'Rialto Enterprises - Dashboard Requirement', value: 200000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Rialto Enterprises Pvt Ltd'), contactId: thameemContactId, expectedCloseDate: new Date('2026-11-28') },
    { title: 'Seikoo Maraica - Networking Relocation', value: 178000, stage: DealStage.LOST, companyId: getCompanyId('Seiko Maraica'), contactId: thameemContactId, expectedCloseDate: new Date('2026-05-08') },
    { title: 'Komos Automotive (Chennai) - FML, SPC-Web', value: 500000, stage: DealStage.NEW, companyId: getCompanyId('Komos Automotive India Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-10') },
    { title: 'Endotherum Fluids - Machine Integration', value: 425000, stage: DealStage.WON, companyId: getCompanyId('Endotherum Fluids'), contactId: defaultContactId, expectedCloseDate: new Date('2026-07-16') },
    { title: 'Jana Engineering Industries - Dashboard Requirement', value: 300000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Necco Tools'), contactId: thameemContactId, expectedCloseDate: new Date('2026-12-01') },
    { title: 'Chirakkal Automotive - Nesting Software', value: 475000, stage: DealStage.WON, companyId: getCompanyId('Chirakkal Automotive'), contactId: defaultContactId, expectedCloseDate: new Date('2026-03-10') },
    { title: 'Komos Automotive (Chennai) - SAP API Integration', value: 200000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Komos Automotive India Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-15') },
    { title: 'Komos Automotive (Pune) - SAP API Integration', value: 200000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Komos Automotive India Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-15') },
    { title: 'KPR Tubes LLP - Green Module, Maintenance & Payroll', value: 2500000, stage: DealStage.PROPOSAL, companyId: getCompanyId('KPR Tubes LLP'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-25') },
    { title: 'Rivit India Fasteners - 7 Modules Implementation', value: 1400000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Rivit India Fasteners Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-20') },
    { title: 'SAAJ Steel Corporation - Green Module, Maint & Payroll', value: 1550000, stage: DealStage.PROPOSAL, companyId: getCompanyId('SAAJ Steel Corporation'), contactId: defaultContactId, expectedCloseDate: new Date('2026-11-18') },
    { title: 'IHD Industries Pvt Ltd - SIP, FML, Online SPC', value: 1915000, stage: DealStage.LOST, companyId: getCompanyId('IHD Industries Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-07-18') },
    { title: 'CY MYUTEC Anand Pvt Ltd - SPC Web Module', value: 425000, stage: DealStage.WON, companyId: getCompanyId('CY MYUTEC Anand Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2025-10-13') },
    { title: 'Vigneshwara Engineering - Green Module Contract', value: 650000, stage: DealStage.NEGOTIATION, companyId: getCompanyId('Vigneshwara Engineering'), contactId: defaultContactId, expectedCloseDate: new Date('2026-11-20') },
    { title: 'Clastek Engineering Ltd - Payroll Processing Module', value: 100000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Clastek Engineering Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-11-15') },
    { title: 'Kwangsung Sandhar Automotive - 8 Modules Ismart Suite', value: 2800000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Kwangsung Sandhar Automotive Systems'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-30') },
    { title: 'Flosil - Bet Coating Pvt Ltd - Green Module ERP', value: 750000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Flosil - Bet Coating Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-10') },
    { title: 'Krishna Industrial Services - Green Module', value: 1200000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Krishna Industrial Services'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-15') },
    { title: 'Monsan Tech India Pvt Ltd - Green Module with Maintenance', value: 1200000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Monsan Tech India Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-18') },
    { title: 'HCT Sun India Pvt Ltd - Warehouse Management Web', value: 700000, stage: DealStage.PROPOSAL, companyId: getCompanyId('HCT Sun India Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-12') },
    { title: 'Shiv Machine Tools - Green Module Suite', value: 1000000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Shiv Machine Tools'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-22') },
    { title: 'Reo Windows - Barcode Printer Retrofitting', value: 107000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Reo Windows'), contactId: balaganeshContactId, expectedCloseDate: new Date('2026-11-20') },
    { title: 'Sasco Engineering Pvt Ltd - Barcode & Traceability', value: 250000, stage: DealStage.LOST, companyId: getCompanyId('Sasco Engineering Pvt Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-06-30') },
    { title: 'Youngshin Automotive - Andon Application', value: 500000, stage: DealStage.NEW, companyId: getCompanyId('Youngshin Automotive India P Ltd'), contactId: defaultContactId, expectedCloseDate: new Date('2026-12-15') },
    { title: 'Saktidhara Textiles - Payroll Processing System', value: 350000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Saktidhara Textiles'), contactId: defaultContactId, expectedCloseDate: new Date('2026-11-30') },
    { title: 'Manto Engg Pvt Ltd - ERP Green Module, Payroll, BI', value: 1300000, stage: DealStage.PROPOSAL, companyId: getCompanyId('Manto Engg Pvt Ltd'), contactId: manikandanContactId, expectedCloseDate: new Date('2026-12-05') }
  ];

  const createdDeals = await Deal.create(dealsDataList);
  logger.info(`💼 Seeded ${createdDeals.length} Deals from Sales Pipeline.`);

  // 7. Seed Quotes
  const quotesDataList = [
    { dealId: createdDeals[0]._id, amount: 1200000, status: QuoteStatus.SENT },
    { dealId: createdDeals[1]._id, amount: 800000, status: QuoteStatus.SENT },
    { dealId: createdDeals[3]._id, amount: 2250000, status: QuoteStatus.ACCEPTED },
    { dealId: createdDeals[9]._id, amount: 425000, status: QuoteStatus.ACCEPTED },
    { dealId: createdDeals[11]._id, amount: 475000, status: QuoteStatus.ACCEPTED },
    { dealId: createdDeals[14]._id, amount: 2500000, status: QuoteStatus.SENT },
    { dealId: createdDeals[18]._id, amount: 425000, status: QuoteStatus.ACCEPTED },
    { dealId: createdDeals[19]._id, amount: 650000, status: QuoteStatus.SENT },
    { dealId: createdDeals[21]._id, amount: 2800000, status: QuoteStatus.SENT },
    { dealId: createdDeals[31]._id, amount: 1300000, status: QuoteStatus.DRAFT }
  ];

  const createdQuotes = await Quote.create(quotesDataList);
  logger.info(`📄 Seeded ${createdQuotes.length} Quotes.`);

  // 8. Seed Real Tasks from TASK MANAGEMENT Sheet
  const tasksDataList = [
    { title: 'Swot Website Remap & Architecture Refactor', dueDate: new Date('2026-07-20'), done: true, contactId: defaultContactId, dealId: createdDeals[3]._id },
    { title: 'Project Tracker Milestone Reconciliation', dueDate: new Date('2026-07-15'), done: false, contactId: defaultContactId, dealId: createdDeals[0]._id },
    { title: 'Prepare Minutes of Meeting (MOM) related to ISIR', dueDate: new Date('2026-07-16'), done: true, contactId: defaultContactId, dealId: createdDeals[9]._id },
    { title: 'ISIR Compliance Verification & Signoff', dueDate: new Date('2026-07-17'), done: true, contactId: defaultContactId, dealId: createdDeals[9]._id },
    { title: 'SP Engineers Onsite Plant & Machinery Visit', dueDate: new Date('2026-07-18'), done: true, contactId: defaultContactId, dealId: createdDeals[4]._id },
    { title: 'Rialto & ATV AMC Reminder Email Follow-up', dueDate: new Date('2026-07-19'), done: false, contactId: thameemContactId, dealId: createdDeals[6]._id },
    { title: 'Phirivas Suresh Kickstart & Scope Review', dueDate: new Date('2026-07-20'), done: true, contactId: createdContacts[6]._id, dealId: createdDeals[3]._id },
    { title: 'Daily Tracker Sheet Validation for Web and Windows Teams', dueDate: new Date('2026-07-21'), done: true, contactId: defaultContactId, dealId: createdDeals[0]._id },
    { title: 'New Swot Brand Logo & System Asset Deployment', dueDate: new Date('2026-07-22'), done: true, contactId: defaultContactId, dealId: createdDeals[3]._id },
    { title: 'BRD Document Submission for Phirivas (Mr. Thameem)', dueDate: new Date('2026-07-14'), done: true, contactId: thameemContactId, dealId: createdDeals[3]._id },
    { title: 'Phirivas Technical Kickoff Session with Engineering Team', dueDate: new Date('2026-07-15'), done: true, contactId: createdContacts[6]._id, dealId: createdDeals[3]._id },
    { title: 'Dashboard Product Specification Document Review', dueDate: new Date('2026-07-16'), done: false, contactId: thameemContactId, dealId: createdDeals[5]._id },
    { title: 'Web Related Quality Management System Integration', dueDate: new Date('2026-07-17'), done: false, contactId: defaultContactId, dealId: createdDeals[8]._id },
    { title: 'Uma Engineering Proposal Submission (Mrs. Priya)', dueDate: new Date('2026-07-18'), done: true, contactId: createdContacts[4]._id, dealId: createdDeals[5]._id },
    { title: 'Ticketing Software Internal Architecture Review', dueDate: new Date('2026-07-10'), done: false, contactId: defaultContactId, dealId: createdDeals[0]._id },
    { title: 'Dashboard Module Classification Matrix (Mr. Prathap)', dueDate: new Date('2026-07-20'), done: false, contactId: createdContacts[5]._id, dealId: createdDeals[5]._id },
    { title: 'New AMC Customers Email Reminder Broadcast (Mr. Thameem)', dueDate: new Date('2026-07-20'), done: false, contactId: thameemContactId, dealId: createdDeals[6]._id },
    { title: 'Checklist for Clients Before ERP Onboarding (Mr. Thameem)', dueDate: new Date('2026-07-20'), done: false, contactId: thameemContactId, dealId: createdDeals[6]._id },
    { title: 'Rialto Dashboard Formal Proposal Delivery (Mr. Thameem)', dueDate: new Date('2026-07-15'), done: true, contactId: thameemContactId, dealId: createdDeals[6]._id },
    { title: 'Auditor Email Introduction & Onboarding (Mr. Prathap)', dueDate: new Date('2026-07-16'), done: true, contactId: createdContacts[5]._id, dealId: createdDeals[0]._id }
  ];

  const createdTasks = await Task.create(tasksDataList);
  logger.info(`✅ Seeded ${createdTasks.length} Tasks from Task Management sheet.`);

  // 9. Seed Tickets from SUPPORT TICKETS Sheet
  const ticketsDataList = [
    { subject: 'Unable to generate GST invoice report (Patched in v4.2.1)', contactId: createdContacts[7]._id, priority: TicketPriority.HIGH, status: TicketStatus.CLOSED },
    { subject: 'Need training on payroll module for new HR staff (Conducted via call)', contactId: createdContacts[8]._id, priority: TicketPriority.MEDIUM, status: TicketStatus.CLOSED },
    { subject: 'Feature request: barcode scanning for inventory tracking', contactId: createdContacts[7]._id, priority: TicketPriority.LOW, status: TicketStatus.OPEN },
    { subject: 'Inventory sync error between multi-site warehouses', contactId: createdContacts[7]._id, priority: TicketPriority.HIGH, status: TicketStatus.OPEN },
    { subject: 'Custom report configuration for board review meeting', contactId: createdContacts[8]._id, priority: TicketPriority.MEDIUM, status: TicketStatus.CLOSED },
    { subject: 'Data migration from legacy POS system (Phase 1 ongoing)', contactId: createdContacts[9]._id, priority: TicketPriority.URGENT, status: TicketStatus.OPEN }
  ];

  const createdTickets = await Ticket.create(ticketsDataList);
  logger.info(`🎫 Seeded ${createdTickets.length} Support Tickets.`);

  // 10. Seed Activities from Follow-up notes
  const activitiesDataList = [
    { type: ActivityType.MEETING, summary: 'Implementation Review Meeting with Tecknoweld Perungudi - Mr. VP', contactId: defaultContactId, dealId: createdDeals[0]._id, timestamp: new Date('2026-07-01T10:00:00Z') },
    { type: ActivityType.MEETING, summary: 'Implementation Review Meeting with Srinar Electronics (Siruseri) - Go live target', contactId: defaultContactId, dealId: createdDeals[1]._id, timestamp: new Date('2026-07-01T14:30:00Z') },
    { type: ActivityType.CALL, summary: 'Dashboard requirement discussion with Uma Engineers (Semmencherry) - MD Approval pending', contactId: thameemContactId, dealId: createdDeals[5]._id, timestamp: new Date('2026-07-01T16:00:00Z') },
    { type: ActivityType.CALL, summary: 'Ismart enquiry follow-up with Modern General Industry - Mr. VP', contactId: defaultContactId, dealId: createdDeals[0]._id, timestamp: new Date('2026-07-01T17:15:00Z') },
    { type: ActivityType.MEETING, summary: 'B2B Sales Portal kickoff with Suresh (Phirivas Suresh Alandur)', contactId: createdContacts[6]._id, dealId: createdDeals[3]._id, timestamp: new Date('2026-07-01T11:00:00Z') },
    { type: ActivityType.MEETING, summary: 'ERP flow study and onsite review with SP Engineers (Kakalur) - Mr. VP', contactId: defaultContactId, dealId: createdDeals[4]._id, timestamp: new Date('2026-07-04T10:30:00Z') },
    { type: ActivityType.MEETING, summary: 'Direct visit & contract finalization with Sakthidharar Mills MD', contactId: defaultContactId, dealId: createdDeals[30]._id, timestamp: new Date('2026-07-31T15:00:00Z') }
  ];

  const createdActivities = await Activity.create(activitiesDataList);
  logger.info(`📅 Seeded ${createdActivities.length} Activity timeline events.`);

  logger.info('✨ Real Excel/CSV Data seeding completed successfully in MongoDB Atlas!');
}

seed()
  .catch((err) => {
    logger.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
    process.exit(0);
  });
