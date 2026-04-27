export interface Inspiration {
  id: string
  image_url: string
  description: string
  similarity?: number
  source_product?: string
  screen_pattern?: string
  industry_vertical?: string
  product_area?: string
  visual_mode?: string
  density?: string
  platform?: string
  layout_pattern?: string
  has_data_viz?: boolean
  has_ai_elements?: boolean
  ui_elements?: string[]
  interaction_types?: string[]
  visual_style?: string[]
  color_scheme?: string
  dominant_color?: string
  flow_type?: string
  keywords?: string
  has_illustrations?: boolean
  has_empty_state?: boolean
  has_onboarding_elements?: boolean
}
