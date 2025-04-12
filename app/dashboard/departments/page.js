"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import CircularSpinner from "@/components/Loading";

// Form schema for new department
const departmentFormSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
});

export default function Department() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchDepartments = async () => {
    const response = await fetch("/api/department");
    const data = await response.json();
    return data.departments;
  };

  const {
    data: departments,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });

  // Filter departments based on search query
  const filteredDepartments = departments?.filter((department) =>
    department.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDepartment = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/department", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create department");
      }

      toast.success("Department created successfully!");
      setIsDialogOpen(false);
      form.reset();

      // Refresh the departments data
      queryClient.invalidateQueries(["departments"]);
    } catch (error) {
      toast.error(
        error.message || "An error occurred while creating the department"
      );
      console.error("Error creating department:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <CircularSpinner size="small" color="text-gray-900" />;
  }

  if (isError) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Department Management</h1>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-4/12">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search departments by name..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          Add New Department
        </Button>
      </div>

      {/* Departments Table */}
      <div className="border rounded-lg mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments && filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <TableRow key={department._id}>
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline">Update</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  {searchQuery
                    ? "No departments match your search."
                    : "No departments found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {filteredDepartments?.length > 0 && (
          <p>
            Showing {filteredDepartments.length} of {departments.length}{" "}
            departments
          </p>
        )}
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new department for your organization.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddDepartment)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Human Resources" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Department"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
