"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

export default function Users() {
  const fetchUsers = async () => {
    const response = await fetch("/api/users");
    console.log("response", response);
    return response.json();
  };

  const {
    data: users,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return <div>{JSON.stringify(users)}</div>;
}
