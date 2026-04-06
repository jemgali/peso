import React from "react";
import { Input } from "@/ui/input";
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.profileContact}>
              <FieldLabel htmlFor="profileContact">Contact Number</FieldLabel>
              <Input
                {...register("profileContact")}
                type="tel"
                id="profileContact"
                disabled={isPending}
                placeholder="+63 9XX-XXX-XXXX"
                aria-invalid={!!errors.profileContact}
              />
              {errors.profileContact && (
                <FieldError>{errors.profileContact.message}</FieldError>
              )}
            </Field>

            <Field data-invalid={!!errors.profileFacebook}>
              <FieldLabel htmlFor="profileFacebook">
                Facebook Profile URL
              </FieldLabel>
              <Input
                {...register("profileFacebook")}
                type="url"
                id="profileFacebook"
                disabled={isPending}
                placeholder="https://facebook.com/username"
                aria-invalid={!!errors.profileFacebook}
              />
              {errors.profileFacebook && (
                <FieldError>{errors.profileFacebook.message}</FieldError>
              )}
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
    </div>
  );
};

export default ContactSection;
