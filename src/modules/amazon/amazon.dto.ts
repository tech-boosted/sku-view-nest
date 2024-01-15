export class LinkAmazonAccountDTO {
  marketplace: string;
}

export class AmazonSetProfileDTO {
  profile_id: string;
  profile_name: string;
}

export class AmazonSaveDTO {
  user_id: string;
  channel_name: string;
  sku_data: AmazonJSONFile[];
}

export interface AmazonJSONFile {
  date: string;
  spend: number;
  unitsSoldSameSku1d: number;
  clicks: number;
  advertisedSku: string;
  sales1d: number;
  impressions: number;
}
