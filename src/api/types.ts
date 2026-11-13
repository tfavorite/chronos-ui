export type PartStatus =
  | 'configuration'
  | 'active'
  | 'draft'
  | 'deprecated'
  | 'obsolete'
  | 'experimental'
  | 'retired'
  | 'recalled'

export interface Part {
  uuid: string
  partNo: string
  name: string
  status: PartStatus
  unit: string
}

export interface Configuration {
  uuid: string
  partUuid: string
  quantity: number
  endUnitSerialNo?: string | null
}

export interface AllowableStatuses {
  partUuid: string
  currentStatus: PartStatus
  allowableStatuses: PartStatus[]
}

export interface UpdatePartBody {
  unit?: string
  status?: PartStatus
}
