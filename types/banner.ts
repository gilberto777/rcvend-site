export type PromotionalBanner = {
  id: string;
  title: string;
  image_url: string;
  mobile_image_url?: string | null;
  image_storage_path?: string | null;
  mobile_image_storage_path?: string | null;
  alt_text: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
  updated_at: string;
};
