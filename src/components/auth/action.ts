// 'use server';

// import { signIn } from '~/lib/auth-server'; // Wrap your authClient here
// import { redirect } from 'next/navigation';
// import { z } from 'zod';

// const formSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
// });

// export async function loginAction(formData: FormData) {
//   const raw = Object.fromEntries(formData.entries());
//   const parsed = formSchema.safeParse(raw);

//   if (!parsed.success) {
//     return { error: parsed.error.flatten().fieldErrors };
//   }

//   const { email, password } = parsed.data;
//   const result = await signIn({ email, password }); // Replace with actual Better Auth call

//   if (result.error) {
//     return { error: { form: result.error.message || 'Failed to login' } };
//   }

//   // Redirect if login is successful
//   redirect('/dashboard');
// }
