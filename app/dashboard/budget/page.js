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

// Form schema for new budget
const budgetFormSchema = z.object({
  dept: z.string().min(1, "Department is required"),
  budget: z.string().refine((val) => !isNaN(val) && Number(val) > 0, {
    message: "Budget must be a valid positive number",
  }),
  year: z.string().refine(
    (val) => {
      const year = Number(val);
      return !isNaN(year) && year >= 2023 && year <= 2030;
    },
    { message: "Year must be valid (2023-2030)" }
  ),
  quater: z.string().refine(
    (val) => {
      const quarter = Number(val);
      return !isNaN(quarter) && quarter >= 1 && quarter <= 4;
    },
    { message: "Quarter must be between 1 and 4" }
  ),
  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

export default function Budget() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      dept: "",
      budget: "",
      year: new Date().getFullYear().toString(),
      quater: "1",
      comment: "",
    },
  });

  // Fetch departments for the dropdown
  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await fetch("/api/department");
      const data = await response.json();
      return data.departments;
    },
  });

  // Fetch budgets
  const fetchBudgets = async () => {
    const response = await fetch("/api/budget");
    const data = await response.json();
    return data.budgets;
  };

  const {
    data: budgets,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["budgets"],
    queryFn: fetchBudgets,
  });

  // Filter budgets based on search query (by department name, year, or quarter)
  const filteredBudgets = budgets?.filter((budget) => {
    const deptName =
      departments?.find((d) => d._id === budget.dept)?.name || "";
    return (
      deptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.year.toString().includes(searchQuery) ||
      budget.quater.toString().includes(searchQuery) ||
      budget.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddBudget = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert numeric strings to numbers
      const formattedData = {
        ...data,
        budget: parseFloat(data.budget),
        year: parseInt(data.year),
        quater: parseInt(data.quater),
      };

      const response = await fetch("/api/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create budget");
      }

      toast.success("Budget created successfully!");
      setIsDialogOpen(false);
      form.reset({
        dept: "",
        budget: "",
        year: new Date().getFullYear().toString(),
        quater: "1",
        comment: "",
      });

      // Refresh the budgets data
      queryClient.invalidateQueries(["budgets"]);
    } catch (error) {
      toast.error(
        error.message || "An error occurred while creating the budget"
      );
      console.error("Error creating budget:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to find department name by ID
  const getDepartmentName = (deptId) => {
    if (!departments) return "Loading...";
    const dept = departments.find((d) => d._id === deptId);
    return dept ? dept.name : "Unknown Department";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading || isDepartmentsLoading) {
    return <CircularSpinner size="small" color="text-gray-900" />;
  }

  if (isError) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Budget Management</h1>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-4/12">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search by department, year, quarter or status..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>Add New Budget</Button>
      </div>

      {/* Budgets Table */}
      <div className="border rounded-lg mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Quarter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBudgets && filteredBudgets.length > 0 ? (
              filteredBudgets.map((budget) => (
                <TableRow key={budget._id}>
                  <TableCell className="font-medium">
                    {getDepartmentName(budget.dept)}
                  </TableCell>
                  <TableCell>{formatCurrency(budget.budget)}</TableCell>
                  <TableCell>{budget.year}</TableCell>
                  <TableCell>{budget.quater}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        budget.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : budget.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {budget.status.charAt(0).toUpperCase() +
                        budget.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(budget.remainingAmount)}
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={budget.comment}
                  >
                    {budget.comment}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  {searchQuery
                    ? "No budgets match your search."
                    : "No budgets found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {filteredBudgets?.length > 0 && (
          <p>
            Showing {filteredBudgets.length} of {budgets.length} budgets
          </p>
        )}
      </div>

      {/* Add Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Budget</DialogTitle>
            <DialogDescription>
              Create a new budget allocation for a department.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddBudget)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="dept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        {...field}
                      >
                        <option value="">Select Department</option>
                        {departments?.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000.00"
                        step="0.01"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <select
                          className="w-full border rounded-md px-3 py-2"
                          {...field}
                        >
                          {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(
                            (year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            )
                          )}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quater"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarter</FormLabel>
                      <FormControl>
                        <select
                          className="w-full border rounded-md px-3 py-2"
                          {...field}
                        >
                          <option value="1">Q1</option>
                          <option value="2">Q2</option>
                          <option value="3">Q3</option>
                          <option value="4">Q4</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <textarea
                        className="w-full border rounded-md px-3 py-2 h-20"
                        placeholder="Add comments about this budget allocation..."
                        {...field}
                      ></textarea>
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
                  {isSubmitting ? "Creating..." : "Create Budget"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
