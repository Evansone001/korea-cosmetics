import { StoreCreateDTO, StoreFormValues } from "@/types/index";

export function mapStoreFormToDTO(form: StoreFormValues): StoreCreateDTO {
  return {
    name: form.storeName,
    description: form.storeDescription,
    username: form.username,
    email: form.email,

    phone: form.phone || null,

    address_line1: form.addressLine1,
    address_line2: form.addressLine2 || null,

    city: form.city,
    state: form.state,
    postal_code: form.postalCode,
    country: form.country,

    business_hours: form.businessHours || null,
    social_media: form.socialMedia || null,
    return_policy: form.returnPolicy || null,
    shipping_policy: form.shippingPolicy || null,
  };
}