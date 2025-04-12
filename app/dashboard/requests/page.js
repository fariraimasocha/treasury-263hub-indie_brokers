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
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import CircularSpinner from "@/components/Loading";

// Form schema for new request
const requestFormSchema = z.object({
  dept: z.string().min(2, "Department must be at least 2 characters"),
  budget: z.string().min(1, "Budget is required"),
  year: z.string().min(4, "Please enter a valid year"),
  quater: z.string().min(1, "Quarter is required"),
  comment: z.string().optional(),
});

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      dept: "",
      budget: "",
      year: "",
      quater: "",
      comment: "",
    },
  });

  const fetchRequests = async () => {
    const response = await fetch("/api/requests");
    return response.json();
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
  const filteredRequests = requests?.filter(
    (request) =>
      request.dept?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.budget?.toString().includes(searchQuery) ||
      request.year?.toString().includes(searchQuery) ||
      request.quater?.toString().includes(searchQuery)
  );

  const handleAddRequest = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create request");
      }

      toast.success("Request created successfully!");
      setIsDialogOpen(false);
      form.reset();

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

  if (isLoading) {
    return <CircularSpinner size="small" color="text-gray-900" />;
  }

  if (isError) {
    return <div className="text-red-500 p-4">Error: {error.message}</div>;
  }

  return (
    <div className="container py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Budget Requests</h1>

      {/* Search Input */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-4/12">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search requests by department, budget or year..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          New Budget Request
        </Button>
      </div>

      {/* Requests Table */}
      <div className="border rounded-lg mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Quarter</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests && filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell className="font-medium">{request.dept}</TableCell>
                  <TableCell>{request.budget}</TableCell>
                  <TableCell>{request.year}</TableCell>
                  <TableCell>{request.quater}</TableCell>
                  <TableCell>{request.comment}</TableCell>
                  <TableCell>
                    <Button variant="outline">Update</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Budget Request</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new budget request.
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
                      <Input placeholder="Finance" {...field} />
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
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="100000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2025" {...field} />
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
                        <option value="">Select Quarter</option>
                        <option value="Q1">Q1</option>
                        <option value="Q2">Q2</option>
                        <option value="Q3">Q3</option>
                        <option value="Q4">Q4</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add additional details about this request..."
                        className="resize-none"
                        {...field}
                      />
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
                  {isSubmitting ? "Creating..." : "Create Request"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
