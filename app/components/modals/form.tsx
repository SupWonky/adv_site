// import { Form, useActionData, useFetcher } from "react-router";
// import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
// import { useForm } from "@conform-to/react";
// import { Field, FieldError } from "../field";
// import { Label } from "../ui/label";
// import { InputConform } from "../conform/input";
// import { Button } from "../ui/button";
// import { Route } from "../../routes/api/v1/+types/form";
// import { useEffect, useState } from "react";
// import { Spinner } from "../spinner";

// const CACHE_PREFIX = "form_data_";
// const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// export function FormDialog({ id }: { id: string }) {
//   const lastResult = useActionData<Route.ComponentProps["actionData"]>();
//   const fetcher = useFetcher<Route.ComponentProps["loaderData"]>();
//   const [form, fields] = useForm({
//     lastResult,
//   });
//   const [formData, setFormData] = useState<
//     Route.ComponentProps["loaderData"] | null
//   >(null);

//   useEffect(() => {
//     // Try to get cached data from localStorage
//     const getCachedData = () => {
//       try {
//         const cacheKey = `${CACHE_PREFIX}${id}`;
//         const cachedItem = localStorage.getItem(cacheKey);

//         if (cachedItem) {
//           const { data, timestamp } = JSON.parse(cachedItem);
//           const now = new Date().getTime();

//           // Check if cache is still valid
//           if (now - timestamp < CACHE_EXPIRY) {
//             return data;
//           } else {
//             localStorage.removeItem(cacheKey);
//           }
//         }
//       } catch (error) {
//         console.error("Error retrieving cached form data:", error);
//       }
//       return null;
//     };

//     // Check cache first
//     const cachedData = getCachedData();
//     if (cachedData) {
//       setFormData(cachedData);
//       return;
//     }

//     // Fetch data if not in cache
//     fetcher.load(`/api/v1/form/${id}`);
//   }, [id]);

//   // Update localStorage when new data arrives from fetcher
//   useEffect(() => {
//     if (fetcher.data) {
//       try {
//         setFormData(fetcher.data);

//         const cacheKey = `${CACHE_PREFIX}${id}`;
//         const cacheData = {
//           data: fetcher.data,
//           timestamp: new Date().getTime(),
//         };

//         localStorage.setItem(cacheKey, JSON.stringify(cacheData));
//       } catch (error) {
//         console.error("Error caching form data:", error);
//       }
//     }
//   }, [fetcher.data, id]);

//   const isLoading = !formData && fetcher.state !== "idle";
//   const isSubmitting = fetcher.state === "submitting";

//   const handleRetry = () => {
//     try {
//       localStorage.removeItem(`${CACHE_PREFIX}${id}`);
//     } catch (error) {
//       console.error("Error clearing cache:", error);
//     }
//     fetcher.load(`/api/v1/form/${id}`);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <Spinner />
//       </div>
//     );
//   }

//   if (!formData) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-96">
//         <p className="text-red-500">Не удалось загрузить форму</p>
//         <Button className="mt-4" onClick={handleRetry}>
//           Retry
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="grid items-start justify-center grid-cols-[minmax(0,320px)] grid-rows-[auto,auto,1fr] min-h-96">
//       <DialogHeader className="mb-8 items-center">
//         <DialogTitle className="mt-8 text-2xl font-medium">
//           {formData.form.name}
//         </DialogTitle>
//         {formData.form.description && (
//           <DialogDescription className="mt-1 text-sm">
//             {formData.form.description}
//           </DialogDescription>
//         )}
//       </DialogHeader>

//       <Form
//         id={form.id}
//         className="space-y-4"
//         method="post"
//         action={`/api/v1/form/${id}`}
//         onSubmit={form.onSubmit}
//       >
//         {formData.form.fields.map((field) => (
//           <Field key={field.name}>
//             <Label
//               htmlFor={fields[field.name]?.id}
//               className="text-sm font-medium"
//             >
//               {field.label}
//               {field.required && <span className="text-red-500 ml-1">*</span>}
//             </Label>
//             <InputConform
//               meta={fields[field.name]}
//               type={field.type}
//               className="w-full"
//             />
//             {fields[field.name]?.errors && (
//               <FieldError>{fields[field.name].errors}</FieldError>
//             )}
//           </Field>
//         ))}

//         <Button className="w-full mt-2" type="submit" disabled={isSubmitting}>
//           {isSubmitting ? "Сохраняю..." : "Отправить"}
//         </Button>
//       </Form>
//     </div>
//   );
// }
