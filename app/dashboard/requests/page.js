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

// Form schema for new request
const requestFormSchema = z.object({
  dept: z.string().min(1, "Department is required"),
  amount: z.string().refine((val) => !isNaN(val) && Number(val) > 0, {
    message: "Amount must be a valid positive number",
  }),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export default function Requests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      dept: "",
      amount: "",
      purpose: "",
      description: "",
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

  // Fetch requests
  const fetchRequests = async () => {
    const response = await fetch("/api/requests");
    const data = await response.json();
    return data.requests;
  };

  const {
    data: requests,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: fetchRequests,
  });

  // Filter requests based on search query
  const filteredRequests = requests?.filter((request) => {
    const deptName =
      departments?.find((d) => d._id === request.dept)?.name || "";
    return (
      deptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddRequest = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert numeric strings to numbers
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create request");
      }

      toast.success("Request created successfully!");
      setIsDialogOpen(false);
      form.reset({
        dept: "",
        amount: "",
        purpose: "",
        description: "",
      });

      // Refresh the requests data
      queryClient.invalidateQueries(["requests"]);
    } catch (error) {
      toast.error(
        error.message || "An error occurred while creating the request"
      );
      console.error("Error creating request:", error);
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || isDepartmentsLoading) {
    return <CircularSpinner size="small" color="text-gray-900" />;
  }

  if (isError) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Request Management</h1>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-4/12">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search by department, purpose, or status..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          Create New Request
        </Button>
      </div>

      {/* Requests Table */}
      <div className="border rounded-lg mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests && filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell className="font-medium">
                    {getDepartmentName(request.dept)}
                  </TableCell>
                  <TableCell>{formatCurrency(request.amount)}</TableCell>
                  <TableCell
                    className="max-w-[200px] truncate"
                    title={request.purpose}
                  >
                    {request.purpose}
                  </TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {searchQuery
                    ? "No requests match your search."
                    : "No requests found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        {filteredRequests?.length > 0 && (
          <p>
            Showing {filteredRequests.length} of {requests.length} requests
          </p>
        )}
      </div>

      {/* Add Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
            <DialogDescription>
              Fill out this form to submit a new financial request.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddRequest)}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Requested</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000.00"
                        step="0.01"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Input placeholder="Office supplies" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="w-full border rounded-md px-3 py-2 h-20"
                        placeholder="Detailed description of what the funds will be used for..."
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
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
