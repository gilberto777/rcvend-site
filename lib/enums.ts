/**
 * Traduções de enums para português
 */

import type {
  PropertyPurpose,
  PropertyStage,
  PropertyType,
  PropertyStatus,
  ApprovalStatus,
  LeadStatus,
  UserRole,
  UserStatus,
} from '@/types/property';

export const purposeLabels: Record<PropertyPurpose, string> = {
  sale: 'Venda',
  rent: 'Aluguel',
  launch: 'Lançamento',
};

export const propertyStageLabels: Record<PropertyStage, string> = {
  launch: 'Lançamento',
  under_construction: 'Em construção',
  ready: 'Pronto para morar',
};

export const typeLabels: Record<PropertyType, string> = {
  apartment: 'Apartamento',
  studio: 'Studio',
  house: 'Casa',
  penthouse: 'Cobertura',
  land: 'Terreno',
  commercial: 'Comercial',
};

export const statusLabels: Record<PropertyStatus, string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  sold: 'Vendido',
  rented: 'Alugado',
  inactive: 'Inativo',
};

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  visiting: 'Visita agendada',
  proposal: 'Proposta',
  converted: 'Convertido',
  lost: 'Perdido',
};

export const userRoleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  agent: 'Corretor',
  agency_owner: 'Proprietário de Imobiliária',
  developer: 'Incorporadora',
};

export const userStatusLabels: Record<UserStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  blocked: 'Bloqueado',
};

/**
 * Função auxiliar para obter label de enum
 */
export function getLabel(value: string, labels: Record<string, string>): string {
  return labels[value] || value;
}

/**
 * Função para traduzir um status de aprovação com cor
 */
export function getApprovalBadgeColor(status: ApprovalStatus): 'yellow' | 'green' | 'red' {
  switch (status) {
    case 'pending':
      return 'yellow';
    case 'approved':
      return 'green';
    case 'rejected':
      return 'red';
    default:
      return 'yellow';
  }
}

/**
 * Função para traduzir um status de lead com cor
 */
export function getLeadStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'blue',
    contacted: 'purple',
    visiting: 'orange',
    proposal: 'yellow',
    converted: 'green',
    lost: 'red',
  };
  return colors[status] || 'gray';
}
