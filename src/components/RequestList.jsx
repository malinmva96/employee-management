import { DateTime } from "luxon";
import { Fragment } from "react";
import { useNavigate, useOutletContext, useSubmit } from "react-router-dom";
import { ArrowSmallRightIcon, TagIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";

function RequestList() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.roleName === "Accountant") navigate("/leave");
  }, [user]);

  return (
    <div className="px-16 py-8">
      <h1 className="mb-6 text-4xl font-bold">Pending requests</h1>
      {user.pending?.length ? (
        user.pending?.map((request, index) => {
          const fromDate = DateTime.fromISO(request.from);
          const toDate = DateTime.fromISO(request.to);
          const days = toDate
            .minus({ days: toDate.weekday })
            .diff(fromDate.minus({ days: fromDate.weekday }))
            .shiftTo("days");
          return (
            <LeaveRequest
              key={index}
              request={{
                ...request,
                days: days
                  .minus({ days: (days.days / 7) * 2 })
                  .minus({ days: fromDate.weekday })
                  .plus({ days: toDate.weekday + 1 })
                  .toHuman(),
              }}
            />
          );
        })
      ) : (
        <p>No pending requests found.</p>
      )}
    </div>
  );
}

function RequestQuota({ quota }) {
  return (
    <div>
      {Object.keys(quota).map((name, index) => {
        const color = ["bg-red-500", "bg-blue-500", "bg-green-500"].find(
          (_, i) => index === i
        );
        return (
          <Fragment key={index}>
            <div className="progress relative w-[160px] h-1 mt-3 mb-1 bg-gray-300 overflow-hidden">
              <div
                className={`absolute top-0 left-0 block h-full w-1/2 ${color}`}
                style={{
                  width: `${(quota[name].value / quota[name].total) * 100}%`,
                }}
              />
            </div>
            <label className="flex justify-between" htmlFor={name}>
              <span>
                {name.replace(/\b([a-z])/g, (_, first) => first.toUpperCase())}
              </span>
              <span>
                {quota[name].value}/{quota[name].total}
              </span>
            </label>
          </Fragment>
        );
      })}
    </div>
  );
}

function LeaveRequest({ request }) {
  const { dialog } = useOutletContext();
  const submit = useSubmit();

  const approveRequest = (request) => {
    dialog.open({
      title: "Approve leave request",
      description: `Are you sure you want to approve ${
        request.days
      } ${request.type.toLowerCase()} leave request for ${request.name}?`,
      primary: {
        label: "Cancel",
        onClick: () => {
          dialog.close();
        },
      },
      secondary: {
        label: "Approve",
        onClick: () => {
          const approveForm = document.createElement("FORM");
          approveForm.setAttribute("action", `/leave/manager`);
          approveForm.setAttribute("method", "put");
          const requestId = document.createElement("INPUT");
          requestId.setAttribute("name", "id");
          requestId.setAttribute("value", request.id);
          approveForm.appendChild(requestId);
          const requestStatus = document.createElement("INPUT");
          requestStatus.setAttribute("name", "status");
          requestStatus.setAttribute("value", "approved");
          approveForm.appendChild(requestStatus);
          submit(approveForm);
          dialog.close();
        },
      },
    });
  };

  const rejectRequest = (request) => {
    dialog.open({
      title: "Reject leave request",
      description: `Are you sure you want to reject ${
        request.days
      } ${request.type.toLowerCase()} leave request for ${request.name}?`,
      primary: {
        label: "Cancel",
        onClick: () => {
          dialog.close();
        },
      },
      secondary: {
        label: "Reject",
        onClick: () => {
          const rejectForm = document.createElement("FORM");
          rejectForm.setAttribute("action", `/leave/manager`);
          rejectForm.setAttribute("method", "put");
          const requestId = document.createElement("INPUT");
          requestId.setAttribute("name", "id");
          requestId.setAttribute("value", request.id);
          rejectForm.appendChild(requestId);
          const requestStatus = document.createElement("INPUT");
          requestStatus.setAttribute("name", "status");
          requestStatus.setAttribute("value", "rejected");
          rejectForm.appendChild(requestStatus);
          submit(rejectForm);
          dialog.close();
        },
      },
    });
  };

  return (
    <div className="flex mb-4 px-6 py-4 border border-blue-500 rounded-lg justify-between items-center gap-4">
      <div>
        <h3 className="text-xl font-semibold">{request.name}</h3>
        <p>
          <span className="block mb-2">Employee no: {request.emp_id}</span>
          <span className="flex mb-8 gap-2 items-center">
            <span className="inline-flex px-2 py-1 bg-red-400 rounded-lg items-center gap-2">
              <TagIcon className="inline w-5 h-5" />
              {request.type}
            </span>
            <span className="px-2 py-1 bg-blue-400 text-bold rounded-lg">
              {request.from}
            </span>
            <ArrowSmallRightIcon className="inline w-5 h-5" />
            <span className="px-2 py-1 bg-blue-400 text-bold rounded-lg">
              {request.to}
            </span>
            <span className="px-2 py-1 bg-green-400 text-bold rounded-lg">
              {request.days}
            </span>
          </span>
        </p>
        <button
          className="px-6 py-4 bg-green-300 font-semibold rounded-md outline-none hover:bg-green-400 active:bg-green-500 focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            approveRequest(request);
          }}
        >
          Approve
        </button>
        <button
          className="ml-2 px-6 py-4 bg-red-300 font-semibold rounded-md outline-none hover:bg-red-400 active:bg-red-500 focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            rejectRequest(request);
          }}
        >
          Reject
        </button>
      </div>
      <RequestQuota quota={request.quota} />
    </div>
  );
}

export default RequestList;
