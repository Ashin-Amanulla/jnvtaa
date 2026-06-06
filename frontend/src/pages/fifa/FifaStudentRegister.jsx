import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { fifaAPI } from "@/api";
import { SketchCard } from "@/components/SketchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm = { name: "", rollNumber: "", email: "", classSection: "" };

export default function FifaStudentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);

  const mutation = useMutation({
    mutationFn: (payload) => fifaAPI.registerStudent(payload),
    onSuccess: () => {
      toast.success("Registered! You can now make your predictions.");
      // Hand the roll/email to the predict page so they don't re-type.
      sessionStorage.setItem(
        "fifaStudent",
        JSON.stringify({ rollNumber: form.rollNumber, email: form.email })
      );
      navigate("/fifa/students/predict");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <SketchCard decoration="tape" className="p-8">
        <h1 className="font-display text-2xl font-bold">Student Registration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your roll number is your key — keep it handy to come back and predict.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rollNumber">Roll number</Label>
            <Input
              id="rollNumber"
              name="rollNumber"
              required
              value={form.rollNumber}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="classSection">Class &amp; section (optional)</Label>
            <Input
              id="classSection"
              name="classSection"
              placeholder="e.g. 10-A"
              value={form.classSection}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Registering…" : "Register"}
          </Button>
        </form>
      </SketchCard>
    </div>
  );
}
