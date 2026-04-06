import React from "react";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import {
  Field,
  FieldSet,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/ui/field";
import type { FormSectionProps } from "./types";

const ContactSection: React.FC<FormSectionProps> = ({
  register,
  errors,
  isPending,
  setSectionRef,
}) => {
  return (
    <div
      id="contact-info"
      ref={setSectionRef("contact-info")}
      className="scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Contact Information</h2>
        <p className="text-sm text-muted-foreground">
          How should we reach you?
        </p>
      </div>

      <FieldGroup>
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.languageDialect}>
            <FieldLabel htmlFor="languageDialect">
              Languages / Dialects
            </FieldLabel>
            <Textarea
              {...register("languageDialect")}
              id="languageDialect"
              disabled={isPending}
              placeholder="e.g., English, Tagalog, Spanish"
              aria-invalid={!!errors.languageDialect}
              className="min-h-24"
            />
            {errors.languageDialect && (
              <FieldError>{errors.languageDialect.message}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.contact}>
            <FieldLabel htmlFor="contact">Contact Number</FieldLabel>
            <Input
              {...register("contact")}
              type="tel"
              id="contact"
              disabled={isPending}
              placeholder="+63 9XX-XXX-XXXX"
              aria-invalid={!!errors.contact}
            />
            {errors.contact && (
              <FieldError>{errors.contact.message}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.facebook}>
            <FieldLabel htmlFor="facebook">Facebook URL</FieldLabel>
            <Input
              {...register("facebook")}
              type="url"
              id="facebook"
              disabled={isPending}
              placeholder="https://facebook.com/username"
              aria-invalid={!!errors.facebook}
            />
            {errors.facebook && (
              <FieldError>{errors.facebook.message}</FieldError>
            )}
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default ContactSection;
