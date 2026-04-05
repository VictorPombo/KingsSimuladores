/**
 * Melhor Envio API Mock/Stub for Development
 */

interface Dimensions {
  weight: number
  width: number
  height: number
  length: number
}

export async function calculateShipping(fromPostalCode: string, toPostalCode: string, dimensions: Dimensions[]) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Fake freight calculation based on postal code ends
  const ending = parseInt(toPostalCode.slice(-1) || '0')
  const basePrice = 85.00 + (ending * 5)
  const baseDays = 4 + (ending % 3)
  
  return [
    {
      id: 1,
      name: 'PAC',
      company: 'Correios',
      price: basePrice.toFixed(2),
      custom_delivery_time: baseDays + 5,
    },
    {
      id: 2,
      name: 'SEDEX',
      company: 'Correios',
      price: (basePrice * 1.8).toFixed(2),
      custom_delivery_time: baseDays,
    },
    {
      id: 3,
      name: '.Package',
      company: 'JadLog',
      price: (basePrice * 0.9).toFixed(2),
      custom_delivery_time: baseDays + 2,
    }
  ]
}
