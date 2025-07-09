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
import { InputConform } from "~/components/conform/input";
import { LoginSchmea } from "~/schema/zod";
import { Field, FieldError } from "~/components/field";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserId(request);

  if (userId) return redirect("/");

  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  const fromData = await request.formData();
  const submission = parseWithZod(fromData, {
    schema: LoginSchmea,
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
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchmea });
    },
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
          <Form method="post" id={form.id}>
            <input
              type="hidden"
              name={fields.redirectTo.name}
              value={redirectTo}
            />
            <div className="space-y-4">
              <Field>
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>

                <InputConform
                  meta={fields.email}
                  autoComplete="email"
                  type="text"
                />
                {fields.email.errors && (
                  <FieldError>{fields.email.errors}</FieldError>
                )}
              </Field>

              <Field>
                <Label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </Label>

                <InputConform
                  meta={fields.password}
                  type="password"
                  autoComplete="current-password"
                />
                {fields.password.errors && (
                  <FieldError>{fields.password.errors}</FieldError>
                )}
              </Field>
            </div>

            <div className="flex items-center justify-between mt-2.5">
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

            <Button type="submit" className="w-full mt-5 font-semibold">
              Войти
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
