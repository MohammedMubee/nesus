export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES_REP = 'SALES_REP'
}

export enum LifecycleStage {
  LEAD = 'LEAD',
  SALES_QUALIFIED = 'SALES_QUALIFIED',
  CHAMPION = 'CHAMPION',
  CUSTOMER = 'CUSTOMER'
}

export enum LeadStatus {
  NEW = 'NEW',
  QUALIFIED = 'QUALIFIED',
  DISQUALIFIED = 'DISQUALIFIED'
}

export enum DealStage {
  NEW = 'NEW',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST'
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE'
}
