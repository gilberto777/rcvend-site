'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Property } from '@/types/property';

/**
 * Salvar (criar ou atualizar) um imóvel
 * Apenas admin pode fazer isto
 */
export async function saveProperty(
  propertyData: Partial<Property> & { id?: string; title: string; slug: string; neighborhood_name: string; city: string; state: string; purpose: string; type: string; price: number; area: number; bedrooms: number; bathrooms: number; suites: number; parking_spaces: number; description: string }
) {
  try {
    const supabase = await createSupabaseServerClient();

    // Verificar autenticação e permissões
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('Não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Sem permissão para editar imóveis');
    }

    // Validar slug único se for novo
    if (!propertyData.id) {
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', propertyData.slug)
        .single();

      if (existing) {
        throw new Error('Este slug já está em uso');
      }
    }

    // Preparar dados
    const dataToSave = {
      title: propertyData.title,
      slug: propertyData.slug,
      description: propertyData.description,
      neighborhood_name: propertyData.neighborhood_name,
      city: propertyData.city,
      state: propertyData.state,
      purpose: propertyData.purpose,
      type: propertyData.type,
      price: propertyData.price,
      area: propertyData.area,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      suites: propertyData.suites,
      parking_spaces: propertyData.parking_spaces,
      status: propertyData.status || 'available',
      approval_status: propertyData.approval_status || 'pending',
      condo_fee: propertyData.condo_fee || null,
      iptu: propertyData.iptu || null,
      address: propertyData.address || null,
      address_number: propertyData.address_number || null,
      complement: propertyData.complement || null,
      latitude: propertyData.latitude || null,
      longitude: propertyData.longitude || null,
      cover_image: propertyData.cover_image || null,
      characteristics: propertyData.characteristics || [],
      is_featured: propertyData.is_featured || false,
      is_active: propertyData.is_active !== false,
      meta_title: propertyData.meta_title || null,
      meta_description: propertyData.meta_description || null,
      video_url: propertyData.video_url || null,
    };

    let result;

    if (propertyData.id) {
      // Atualizar
      const { data, error } = await supabase
        .from('properties')
        .update(dataToSave)
        .eq('id', propertyData.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar
      const { data, error } = await supabase
        .from('properties')
        .insert([dataToSave])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return {
      success: true,
      message: propertyData.id ? 'Imóvel atualizado com sucesso' : 'Imóvel criado com sucesso',
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao salvar imóvel';
    return {
      success: false,
      message,
      error: message,
    };
  }
}

/**
 * Deletar um imóvel (com confirmação implícita)
 */
export async function deleteProperty(propertyId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('Não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Sem permissão');
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw error;

    return {
      success: true,
      message: 'Imóvel deletado com sucesso',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao deletar imóvel';
    return {
      success: false,
      message,
      error: message,
    };
  }
}

/**
 * Atualizar estado do imóvel (ativo, destaque, aprovação)
 */
export async function updatePropertyState(
  propertyId: string,
  updates: Partial<Pick<Property, 'is_active' | 'is_featured' | 'approval_status' | 'status'>>
) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('Não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Sem permissão');
    }

    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId);

    if (error) throw error;

    return {
      success: true,
      message: 'Imóvel atualizado com sucesso',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar imóvel';
    return {
      success: false,
      message,
      error: message,
    };
  }
}

/**
 * Duplicar um imóvel
 */
export async function duplicateProperty(propertyId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('Não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Sem permissão');
    }

    // Buscar o imóvel original
    const { data: original, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (fetchError || !original) throw new Error('Imóvel não encontrado');

    // Preparar cópia
    const copy = {
      ...original,
      id: undefined,
      title: `${original.title} (cópia)`,
      slug: `${original.slug}-copia-${Date.now()}`,
      is_active: false,
      is_featured: false,
      approval_status: 'pending' as const,
      created_at: undefined,
      updated_at: undefined,
    };

    const { data: duplicated, error: insertError } = await supabase
      .from('properties')
      .insert([copy])
      .select()
      .single();

    if (insertError) throw insertError;

    return {
      success: true,
      message: 'Imóvel duplicado com sucesso',
      data: duplicated,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao duplicar imóvel';
    return {
      success: false,
      message,
      error: message,
    };
  }
}

/**
 * Alterar status de um lead
 */
export async function updateLeadStatus(leadId: string, status: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('Não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Sem permissão');
    }

    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (error) throw error;

    return {
      success: true,
      message: 'Lead atualizado com sucesso',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar lead';
    return {
      success: false,
      message,
      error: message,
    };
  }
}

/**
 * Deletar um lead
 */
export async function deleteLead(leadId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('Não autenticado');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Sem permissão');
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;

    return {
      success: true,
      message: 'Lead deletado com sucesso',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao deletar lead';
    return {
      success: false,
      message,
      error: message,
    };
  }
}
