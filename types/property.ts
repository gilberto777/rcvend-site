export type PropertyPurpose = "sale" | "rent" | "launch";
export type PropertyStage = "launch" | "under_construction" | "ready";
export type PropertyStatus = "available" | "reserved" | "sold" | "rented" | "inactive";
export type PropertyType = "studio" | "apartment" | "house" | "penthouse" | "commercial" | "land";
export type PropertyProgram = "his2" | "hmp" | "r2v" | "nr";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type UserRole = "admin" | "agent" | "agency_owner" | "developer";
export type UserStatus = "pending" | "active" | "blocked";
export type LeadStatus = "new" | "contacted" | "visiting" | "proposal" | "converted" | "lost";

export type PropertyImage = {
  id: string;
  property_id: string;
  url: string;
  alt: string;
  sort_order: number;
  is_cover: boolean;
};

export type PropertyFloorPlan = {
  id: string;
  property_id: string;
  url: string;
  title?: string | null;
  sort_order: number;
};

export type Property = {
  id: string;
  code?: string | null;
  organization_id?: string | null;
  agent_id?: string | null;
  developer_id?: string | null;
  neighborhood_id?: string | null;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  purpose: PropertyPurpose;
  property_stage: PropertyStage;
  status: PropertyStatus;
  approval_status?: ApprovalStatus;
  price: number;
  condo_fee?: number | null;
  iptu?: number | null;
  area: number;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  parking_spaces: number;
  address_number?: string | null;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cover_image: string;
  images: PropertyImage[];
  floor_plans?: PropertyFloorPlan[];
  characteristics: string[];
  is_featured: boolean;
  is_launch: boolean;
  is_active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  video_url?: string | null;
  tour_url?: string | null;
  developer?: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyFilters = {
  q?: string;
  purpose?: PropertyPurpose | "all";
  stage?: PropertyStage | "all";
  type?: PropertyType | "all";
  city?: string;
  neighborhood?: string;
  program?: PropertyProgram | "all";
  sort?: "recent" | "price_asc" | "price_desc" | "area_desc";
  page?: number;
};

export type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  creci?: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  type: "agency" | "independent_agent" | "developer" | "team" | "owner";
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export type Neighborhood = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  description?: string | null;
  image_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Developer = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Lead = {
  id: string;
  property_id?: string | null;
  organization_id?: string | null;
  agent_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  message?: string | null;
  source: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};
