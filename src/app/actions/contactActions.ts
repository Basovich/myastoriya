'use server';

export interface ContactFormState {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function submitContactFormAction(
  prevState: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get('name')?.toString() || '';
  const phone = formData.get('phone')?.toString() || '';
  const message = formData.get('message')?.toString() || '';

  if (!name.trim()) {
    return { success: false, errors: { name: 'Введіть ім’я' } };
  }
  if (!phone.trim()) {
    return { success: false, errors: { phone: 'Введіть номер телефону' } };
  }

  try {
    console.log('Contact form submission:', { name, phone, message });
    return {
      success: true,
      message: 'Ваше повідомлення успішно надіслано!',
    };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      message: 'Сталася помилка при надсиланні. Спробуйте пізніше.',
    };
  }
}
