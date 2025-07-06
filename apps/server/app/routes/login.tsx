import { redirect } from "react-router";
import { Form, useSearchParams } from "react-router";
import { z } from "zod";
import { createUserSession, getUserId } from "~/session.server";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { safeRedirect } from "~/utils";
import { verifyLogin } from "~/models/user.server";
import { useForm } from "@conform-to/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Route } from "./+types/login";

const schema = z.object({
  email: z
    .string({ message: "Введите почту" })
    .email({ message: "Неправильный формат почты" }),
  password: z.string({ message: "Введите пароль" }),
  remember: z.boolean().optional(),
  redirectTo: z.string().optional(),
});

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request);

  if (userId) return redirect("/");

  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  const fromData = await request.formData();
  const submission = parseWithZod(fromData, {
    schema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email, password, remember, redirectTo } = submission.value;
  const redirectToSafe = safeRedirect(redirectTo);

  const user = await verifyLogin(email, password);

  if (!user) {
    return submission.reply({
      formErrors: ["Неправильный логин или пароль"],
    });
  }

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: redirectToSafe,
    remember: remember ?? false,
  });
};

export const meta: Route.MetaFunction = () => {
  return [{ title: "Войти в аккаунт" }];
};

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const [form, fields] = useForm({
    lastResult: actionData,
    constraint: getZodConstraint(schema),
  });

  return (
    <div className="flex flex-1 justify-center items-start my-48">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-xl">Вход</CardTitle>
          {form.errors && (
            <CardDescription className="text-destructive">
              {form.errors}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4" id={form.id}>
            <div>
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name={fields.email.name}
                  autoComplete="email"
                />
                {fields.email.errors && (
                  <div className="pt-1 text-sm text-destructive">
                    {fields.email.errors}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Пароль
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name={fields.password.name}
                  type="password"
                  autoComplete="current-password"
                />
                {fields.password.errors && (
                  <div className="pt-1 text-sm text-destructive">
                    {fields.password.errors}
                  </div>
                )}
              </div>
            </div>

            <input
              type="hidden"
              name={fields.redirectTo.name}
              value={redirectTo}
            />
            <Button type="submit" className="w-full">
              Войти
            </Button>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  name={fields.remember.name}
                  defaultChecked
                />
                <Label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Запомнить
                </Label>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
