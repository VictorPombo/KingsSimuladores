/**
 * @kings/db — Database Types
 *
 * Gerado automaticamente via:
 * npx supabase gen types typescript --project-id mlrcaugthlkscusyxqrf > packages/db/src/database.types.ts
 *
 * Este arquivo é um placeholder tipado manualmente para desenvolvimento.
 * Regenerar com o comando acima após rodar os SQL migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          name: 'kings' | 'msu' | 'seven'
          cnpj: string
          display_name: string
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: 'kings' | 'msu' | 'seven'
          cnpj: string
          display_name: string
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: 'kings' | 'msu' | 'seven'
          cnpj?: string
          display_name?: string
          settings?: Json
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          auth_id: string
          full_name: string | null
          cpf_cnpj: string | null
          phone: string | null
          email: string | null
          role: 'client' | 'seller' | 'admin'
          addresses: Json
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          full_name?: string | null
          cpf_cnpj?: string | null
          phone?: string | null
          email?: string | null
          role?: 'client' | 'seller' | 'admin'
          addresses?: Json
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          full_name?: string | null
          cpf_cnpj?: string | null
          phone?: string | null
          email?: string | null
          role?: 'client' | 'seller' | 'admin'
          addresses?: Json
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          brand_scope: 'kings' | 'msu' | 'seven' | null
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          brand_scope?: 'kings' | 'msu' | 'seven' | null
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          brand_scope?: 'kings' | 'msu' | 'seven' | null
          sort_order?: number
        }
      }
      products: {
        Row: {
          id: string
          brand_id: string
          category_id: string | null
          title: string
          description: string | null
          slug: string
          price: number
          price_compare: number | null
          stock: number
          sku: string | null
          cnpj_emitente: string
          status: 'active' | 'draft' | 'archived'
          attributes: Json
          images: string[]
          weight_kg: number | null
          dimensions_cm: Json | null
          ncm: string | null
          ean: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          category_id?: string | null
          title: string
          description?: string | null
          slug: string
          price: number
          price_compare?: number | null
          stock?: number
          sku?: string | null
          cnpj_emitente: string
          status?: 'active' | 'draft' | 'archived'
          attributes?: Json
          images?: string[]
          weight_kg?: number | null
          dimensions_cm?: Json | null
          ncm?: string | null
          ean?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          slug?: string
          price?: number
          price_compare?: number | null
          stock?: number
          sku?: string | null
          cnpj_emitente?: string
          status?: 'active' | 'draft' | 'archived'
          attributes?: Json
          images?: string[]
          weight_kg?: number | null
          dimensions_cm?: Json | null
          ncm?: string | null
          ean?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      marketplace_listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          price: number
          condition: 'like_new' | 'good' | 'fair'
          status: 'pending_review' | 'active' | 'sold' | 'rejected'
          images: string[]
          rejection_reason: string | null
          commission_rate: number
          shipping_options: Json
          category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          price: number
          condition: 'like_new' | 'good' | 'fair'
          status?: 'pending_review' | 'active' | 'sold' | 'rejected'
          images?: string[]
          rejection_reason?: string | null
          commission_rate?: number
          shipping_options?: Json
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string | null
          price?: number
          condition?: 'like_new' | 'good' | 'fair'
          status?: 'pending_review' | 'active' | 'sold' | 'rejected'
          images?: string[]
          rejection_reason?: string | null
          commission_rate?: number
          shipping_options?: Json
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          brand_origin: 'kings' | 'msu' | 'seven'
          order_type: 'direct' | 'marketplace'
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost: number
          discount: number
          total: number
          payment_method: string | null
          payment_id: string | null
          preference_id: string | null
          cnpj_emitente: string | null
          shipping_address: Json | null
          tracking_code: string | null
          coupon_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          brand_origin: 'kings' | 'msu' | 'seven'
          order_type?: 'direct' | 'marketplace'
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost?: number
          discount?: number
          total: number
          payment_method?: string | null
          payment_id?: string | null
          preference_id?: string | null
          cnpj_emitente?: string | null
          shipping_address?: Json | null
          tracking_code?: string | null
          coupon_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          brand_origin?: 'kings' | 'msu' | 'seven'
          order_type?: 'direct' | 'marketplace'
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          shipping_cost?: number
          discount?: number
          total?: number
          payment_method?: string | null
          payment_id?: string | null
          preference_id?: string | null
          cnpj_emitente?: string | null
          shipping_address?: Json | null
          tracking_code?: string | null
          coupon_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      invoices: {
        Row: {
          id: string
          order_id: string
          cnpj_emitente: string
          nfe_number: string | null
          nfe_key: string | null
          status: 'pending' | 'issued' | 'cancelled'
          xml_url: string | null
          pdf_url: string | null
          provider_id: string | null
          issued_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          cnpj_emitente: string
          nfe_number?: string | null
          nfe_key?: string | null
          status?: 'pending' | 'issued' | 'cancelled'
          xml_url?: string | null
          pdf_url?: string | null
          provider_id?: string | null
          issued_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          cnpj_emitente?: string
          nfe_number?: string | null
          nfe_key?: string | null
          status?: 'pending' | 'issued' | 'cancelled'
          xml_url?: string | null
          pdf_url?: string | null
          provider_id?: string | null
          issued_at?: string | null
          created_at?: string
        }
      }
      marketplace_orders: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          listing_id: string
          total_price: number
          commission_rate: number
          kings_fee: number
          seller_net: number
          status: string | null
          mp_preference_id: string | null
          mp_payment_id: string | null
          shipping_address: Json | null
          tracking_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          listing_id: string
          total_price: number
          commission_rate?: number
          kings_fee: number
          seller_net: number
          status?: string | null
          mp_preference_id?: string | null
          mp_payment_id?: string | null
          shipping_address?: Json | null
          tracking_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          listing_id?: string
          total_price?: number
          commission_rate?: number
          kings_fee?: number
          seller_net?: number
          status?: string | null
          mp_preference_id?: string | null
          mp_payment_id?: string | null
          shipping_address?: Json | null
          tracking_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      commissions: {
        Row: {
          id: string
          marketplace_order_id: string | null
          seller_id: string
          sale_amount: number
          commission_rate: number
          commission_amount: number
          seller_payout: number
          payout_status: 'pending' | 'paid'
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          marketplace_order_id?: string | null
          seller_id: string
          sale_amount: number
          commission_rate: number
          commission_amount: number
          seller_payout: number
          payout_status?: 'pending' | 'paid'
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          marketplace_order_id?: string | null
          seller_id?: string
          sale_amount?: number
          commission_rate?: number
          commission_amount?: number
          seller_payout?: number
          payout_status?: 'pending' | 'paid'
          paid_at?: string | null
          created_at?: string
        }
      }
      cart: {
        Row: {
          id: string
          customer_id: string
          brand: 'kings' | 'msu' | 'seven'
          items: Json
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          brand: 'kings' | 'msu' | 'seven'
          items?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          brand?: 'kings' | 'msu' | 'seven'
          items?: Json
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          brand_scope: 'kings' | 'msu' | 'seven' | null
          type: 'percent' | 'fixed' | 'shipping'
          value: number
          usage_limit: number | null
          usage_count: number
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          brand_scope?: 'kings' | 'msu' | 'seven' | null
          type: 'percent' | 'fixed' | 'shipping'
          value: number
          usage_limit?: number | null
          usage_count?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          brand_scope?: 'kings' | 'msu' | 'seven' | null
          type?: 'percent' | 'fixed' | 'shipping'
          value?: number
          usage_limit?: number | null
          usage_count?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Enums: {
      user_role: 'client' | 'seller' | 'admin'
      brand_name: 'kings' | 'msu' | 'seven'
      product_status: 'active' | 'draft' | 'archived'
      listing_status: 'pending_review' | 'active' | 'sold' | 'rejected'
      listing_condition: 'like_new' | 'good' | 'fair'
      order_status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
      order_type: 'direct' | 'marketplace'
      invoice_status: 'pending' | 'issued' | 'cancelled'
      payout_status: 'pending' | 'paid'
      coupon_type: 'percent' | 'fixed' | 'shipping'
    }
  }
}
