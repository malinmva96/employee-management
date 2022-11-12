import React, { Fragment } from "react";
import { useState } from "react";
import { useReducer } from "react";
import { useEffect } from "react";
import * as jose from "jose";
import ReactDOM from "react-dom/client";
import {
  ArrowSmallLeftIcon,
  ArrowSmallRightIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "react-router-dom";
import App from "./App";
import LeaveRequest from "./components/LeaveRequest";
import Login from "./components/Login";
import RequestList from "./components/RequestList";
import "./index.css";
import { DateTime, Duration } from "luxon";

function Authorizer() {
  const { user } = useLoaderData();

  return (
    <Fragment>
      <Outlet context={{ user }} />
    </Fragment>
  );
}

function ErrorHandler() {
  const error = useRouteError();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="px-16 py-8">
      <h1 className="mb-6 text-4xl font-bold">
        Could not perform the operation
      </h1>
      <p className="mb-4">{error.message}</p>
      <button
        className="flex pl-4 pr-6 py-4 bg-blue-300 font-semibold rounded-md outline-none items-center gap-2 hover:bg-blue-400 active:bg-blue-500 focus:ring-2 focus:ring-blue-500"
        onClick={goBack}
      >
        <ArrowSmallLeftIcon className="w-6 h-6" />
        <span>Go Back</span>
      </button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/*",
    element: <Authorizer />,
    loader: async () => {
      const accessToken = localStorage.getItem("accessToken");
      let user = accessToken && jose.decodeJwt(accessToken);
      if (user?.roleName === "Accountant") {
        const [leaves, leaveRequests] = await Promise.all([
          fetch("http://123.231.95.112:15000/api/v1/leaves", {
            method: "GET",
            headers: { "x-auth-token": accessToken },
          }).then((res) => {
            if (res.status === 200) return res.json();
          }),
          fetch("http://123.231.95.112:15000/api/v1/leaveRequest", {
            method: "GET",
            headers: { "x-auth-token": accessToken },
          }).then((res) => {
            if (res.status === 200) return res.json();
          }),
        ]);
        user.leaves = leaves.map((item) => ({
          name: item.leaveType.replace(/\b([a-z])/g, function (_, first) {
            return first.toUpperCase();
          }),
          available: {
            value: item.leaveBalance,
            formatted: Duration.fromObject({
              days: item.leaveBalance,
            }).toHuman(),
          },
        }));
        console.log(leaveRequests);
        user.requests = leaveRequests.reverse().map((item) => {
          const fromDate = DateTime.fromISO(item.fromDate);
          const toDate = DateTime.fromISO(item.toDate);
          const days = toDate
            .minus({ days: toDate.weekday })
            .diff(fromDate.minus({ days: fromDate.weekday }))
            .shiftTo("days");

          return {
            id: item.id,
            type: item.leaveType.replace(/\b([a-z])/g, function (_, first) {
              return first.toUpperCase();
            }),
            from: item.fromDate,
            to: item.toDate,
            status: item.status.replace(/\b([a-z])/g, function (_, first) {
              return first.toUpperCase();
            }),
            days: days
              .minus({ days: (days.days / 7) * 2 })
              .minus({ days: fromDate.weekday })
              .plus({ days: toDate.weekday + 1 })
              .toHuman(),
          };
        });
      }
      if (user?.roleName === "Manager") {
        const leaveRequests = await fetch(
          "http://123.231.95.112:15000/api/v1/leaveRequest?getAllLeaveRequests=true",
          {
            method: "GET",
            headers: { "x-auth-token": accessToken },
          }
        ).then((res) => {
          if (res.status === 200) return res.json();
        });
        user.pending = leaveRequests
          .filter((item) => item.status === "pending")
          .map((item) => {
            const fromDate = DateTime.fromISO(item.fromDate);
            const toDate = DateTime.fromISO(item.toDate);
            const days = toDate
              .minus({ days: toDate.weekday })
              .diff(fromDate.minus({ days: fromDate.weekday }))
              .shiftTo("days");

            return {
              id: item.id,
              name: `${item.Employee.firstName} ${item.Employee.lastName}`,
              emp_id: item.EmployeeId,
              type: item.leaveType.replace(/\b([a-z])/g, function (_, first) {
                return first.toUpperCase();
              }),
              from: item.fromDate,
              to: item.toDate,
              days: days
                .minus({ days: (days.days / 7) * 2 })
                .minus({ days: fromDate.weekday })
                .plus({ days: toDate.weekday + 1 })
                .toHuman(),
              quota: item.Employee.Leaves.reduce(
                (obj, item) => ({
                  ...obj,
                  [item.leaveType]: {
                    value: item.leaveBalance,
                    total: item.leaveType === "annual" ? 14 : 7,
                  },
                }),
                {}
              ),
            };
          });
        console.log(user.pending);
      }
      return { user };
    },
    children: [
      {
        path: "*",
        element: <App />,
        children: [
          {
            path: "leave",
            errorElement: <ErrorHandler />,
            action: async ({ request }) => {
              switch (request.method) {
                case "POST": {
                  const accessToken = localStorage.getItem("accessToken");
                  const formData = await request.formData();
                  const body = JSON.stringify({
                    leaveType: formData.get("type"),
                    fromDate: formData.get("from"),
                    toDate: formData.get("to"),
                  });
                  try {
                    await fetch(
                      "http://123.231.95.112:15000/api/v1/leaveRequest/",
                      {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                          "content-length": body.length,
                          "x-auth-token": accessToken,
                        },
                        body,
                      }
                    ).then(async (res) => {
                      if (res.status === 200) return await res.json();
                      throw await res.text();
                    });
                  } catch (msg) {
                    throw new Error(msg);
                  }
                  return;
                }
                case "DELETE": {
                  const accessToken = localStorage.getItem("accessToken");
                  const formData = await request.formData();
                  await fetch(
                    `http://123.231.95.112:15000/api/v1/leaveRequest/${formData.get(
                      "id"
                    )}`,
                    {
                      method: "DELETE",
                      headers: {
                        "x-auth-token": accessToken,
                      },
                    }
                  ).then(async (res) => {
                    if (res.status !== 200) throw await res.text();
                  });
                  return;
                }
              }
            },
            children: [
              {
                index: true,
                element: <LeaveRequest />,
              },
              {
                path: "manager",
                element: <RequestList />,
                action: async ({ request }) => {
                  const accessToken = localStorage.getItem("accessToken");
                  const formData = await request.formData();
                  const body = JSON.stringify({
                    status: formData.get("status"),
                  });
                  try {
                    await fetch(
                      `http://123.231.95.112:15000/api/v1/leaveRequest/${formData.get(
                        "id"
                      )}`,
                      {
                        method: "PUT",
                        headers: {
                          "content-type": "application/json",
                          "content-length": body.length,
                          "x-auth-token": accessToken,
                        },
                        body,
                      }
                    ).then(async (res) => {
                      if (res.status === 200) return await res.json();
                      throw await res.text();
                    });
                  } catch (msg) {
                    throw new Error(msg);
                  }
                },
              },
            ],
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
        errorElement: <Login />,
        action: async ({ request }) => {
          switch (request.method) {
            case "POST": {
              const formData = await request.formData();
              const body = JSON.stringify({
                userName: formData.get("username"),
                password: formData.get("password"),
              });
              let jwt;
              try {
                jwt = await fetch(
                  "http://123.231.95.112:15000/api/v1/employee/login",
                  {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                      "content-length": body.length,
                    },
                    body,
                  }
                ).then(async (res) => {
                  if (res.status === 200) return await res.json();
                  throw await res.text();
                });
              } catch (e) {
                throw new Error(e.message || e);
              } finally {
                if (jwt && typeof jwt.token === "string")
                  localStorage.setItem("accessToken", jwt.token);
              }
              return;
            }
            case "DELETE": {
              localStorage.removeItem("accessToken");
              return;
            }
          }
        },
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
