export type Tier = 'well' | 'standard' | 'premium';
export const BASE_PRICE_CENTS: Record<Tier, number> = {well:2500,standard:3500,premium:5000};
export type QuoteInput = {tier:Tier; guests:number; glassware:boolean; extraSparkling:boolean; upgradesPerGuestCents?:number};
export function calculateQuote(input:QuoteInput) {
 if(!Number.isInteger(input.guests)||input.guests<20||input.guests>10000) throw new Error('Guest count must be between 20 and 10000');
 const upgrade = input.upgradesPerGuestCents ?? 0;
 if(!Number.isInteger(upgrade)||upgrade<0) throw new Error('Invalid upgrade');
 const perGuestCents=BASE_PRICE_CENTS[input.tier]+(input.glassware?500:0)+(input.extraSparkling?500:0)+upgrade;
 return {perGuestCents,subtotalCents:perGuestCents*input.guests,depositCents:50000};
}
