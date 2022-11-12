import { Listbox } from "@headlessui/react";
import {
  ArrowSmallRightIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useRouteError,
  useSubmit,
} from "react-router-dom";

function LeaveRequest() {
  const { dialog, user } = useOutletContext();
  const navigate = useNavigate();
  const submit = useSubmit();
  const submitFormRef = useRef(null);
  const routeError = useRouteError();
  const [selectedType, setSelectedType] = useState(user?.leaves?.[0]);
  const [selectedFromDate, setSelectedFromDate] = useState("");
  const [selectedToDate, setSelectedToDate] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.roleName === "Manager") navigate("/leave/manager");
  }, [user]);

  useEffect(() => {
    console.log(routeError);
  }, [routeError]);

  const validateData = () => {
    if (error) setError(null);
    if (!selectedType.available.value)
      return setError(
        `Cannot perform allocation: The leave type "${selectedType.name}" has zero days.`
      );
    const dateCheckData = [
      { name: "Leave from", value: selectedFromDate },
      { name: "Leave to", value: selectedToDate },
    ];
    let dateCheck;
    if ((dateCheck = dateCheckData.find((item) => !item.value)))
      return setError(
        `Cannot perform allocation: The date contained in "${dateCheck.name}" is invalid.`
      );
    const fromDate = DateTime.fromISO(selectedFromDate);
    if (fromDate.diffNow().milliseconds <= 0)
      return setError(
        'Error during allocation: The date contained in "Leave from" cannot be same or earlier than current date.'
      );
    const toDate = DateTime.fromISO(selectedToDate);
    const weekendCheckData = [
      { name: "Leave from", value: fromDate },
      { name: "Leave to", value: toDate },
    ];
    let weekendCheck;
    if (
      (weekendCheck = weekendCheckData.find((item) =>
        [6, 7].includes(item.value.weekday)
      ))
    )
      return setError(
        `Error during allocation: The date contained in "${weekendCheck.name}" is on a weekend.`
      );
    let allocationDays = toDate
      .minus({ days: toDate.weekday })
      .diff(fromDate.minus({ days: fromDate.weekday }))
      .shiftTo("days");
    if (
      (allocationDays = allocationDays
        .minus({ days: (allocationDays.days / 7) * 2 })
        .minus({ days: fromDate.weekday })
        .plus({ days: toDate.weekday + 1 })).days <= 0
    )
      return setError(
        'Error during allocation: The date contained in "Leave to" cannot be earlier than "Leave from".'
      );
    if (allocationDays.days > selectedType.available.value)
      return setError(
        `Error during allocation: Cannot allocate ${allocationDays.toHuman()} while leave type "${
          selectedType.name
        }" has only ${selectedType.available.formatted}.`
      );
    dialog.open({
      title: "Leave request confirmation",
      description: "Are you sure you want to submit this request?",
      body: (
        <p>
          <span>Leave type: {selectedType?.name}</span>
          <br />
          <span className="flex items-center">
            <span>Leave duration:</span>
            <span className="ml-1 px-2 py-1 bg-blue-400 text-bold rounded-lg">
              {selectedFromDate}
            </span>
            <ArrowSmallRightIcon className="inline w-5 h-5 ml-1" />
            <span className="ml-1 px-2 py-1 bg-blue-400 text-bold rounded-lg">
              {selectedToDate}
            </span>
            <span className="ml-2 px-2 py-1 bg-green-400 text-bold rounded-lg">
              {allocationDays.toHuman()}
            </span>
          </span>
        </p>
      ),
      primary: {
        label: "Cancel",
        onClick: () => {
          dialog.close();
        },
      },
      secondary: {
        label: "Submit",
        onClick: () => {
          submit(submitFormRef.current);
          dialog.close();
        },
      },
    });
  };

  const cancelRequest = (request) => {
    dialog.open({
      title: "Leave request deletion",
      description: "Are you sure you want to delete this request?",
      body: (
        <p>
          <span>Leave type: {request.type}</span>
          <br />
          <span className="flex items-center">
            <span>Leave duration:</span>
            <span className="ml-1 px-2 py-1 bg-blue-400 text-bold rounded-lg">
              {request.from}
            </span>
            <ArrowSmallRightIcon className="inline w-5 h-5 ml-1" />
            <span className="ml-1 px-2 py-1 bg-blue-400 text-bold rounded-lg">
              {request.to}
            </span>
            <span className="ml-2 px-2 py-1 bg-green-400 text-bold rounded-lg">
              {request.days}
            </span>
          </span>
        </p>
      ),
      primary: {
        label: "Cancel",
        onClick: () => {
          dialog.close();
        },
      },
      secondary: {
        label: "Delete",
        onClick: () => {
          const deleteForm = document.createElement("FORM");
          deleteForm.setAttribute("action", `/leave`);
          deleteForm.setAttribute("method", "delete");
          const requestId = document.createElement("INPUT");
          requestId.setAttribute("name", "id");
          requestId.setAttribute("value", request.id);
          deleteForm.appendChild(requestId);
          submit(deleteForm);
          dialog.close();
        },
      },
    });
  };

  return (
    <div className="px-16 py-8">
      <h1 className="mb-6 text-4xl font-bold">My requests</h1>
      <h2 className="mb-4 text-2xl font-semibold">Request new leave</h2>
      <form ref={submitFormRef} action="/leave" method="post">
        <div className="grid py-6 grid-cols-3 gap-6">
          <GridItem>
            <label className="mb-1 font-semibold" htmlFor="emp_no">
              Employee no
            </label>
            <input
              className="text-lg outline-none"
              type="text"
              id="emp_no"
              value={user?.userId}
              readOnly
            />
          </GridItem>
          <GridItem className="col-span-2">
            <label className="mb-1 font-semibold" htmlFor="emp_name">
              Employee name
            </label>
            <input
              className="text-lg outline-none"
              type="text"
              id="emp_name"
              value={user?.name}
              readOnly
            />
          </GridItem>
          <GridItem>
            <label className="mb-1 font-semibold" htmlFor="leave_type">
              Leave type
            </label>
            <div className="relative w-full">
              <input
                type="hidden"
                name="type"
                value={selectedType?.name.toLowerCase()}
                readOnly
              />
              <Listbox value={selectedType} onChange={setSelectedType}>
                <Listbox.Button className="flex w-full h-14 p-3 border-2 border-blue-200 text-lg rounded-md justify-between items-center outline-none cursor-default focus:border-blue-500">
                  <span>{selectedType?.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-sm font-bold rounded-lg ${
                        selectedType?.available.value
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    >
                      {selectedType?.available.formatted}
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-300 rounded-md">
                  {user?.leaves?.map((type, index) => (
                    <Listbox.Option
                      className={({ selected }) =>
                        `p-3 ${
                          selected ? "bg-blue-400" : "hover:bg-blue-400/30"
                        }`
                      }
                      key={index}
                      value={type}
                      disabled={!type.available.value}
                    >
                      <div
                        className={`flex justify-between ${
                          !type.available.value ? "opacity-40" : "opacity-100"
                        }`}
                      >
                        <span>{type.name}</span>
                        <span
                          className={`px-2 py-1 text-sm font-bold rounded-lg ${
                            type.available.value ? "bg-green-400" : "bg-red-400"
                          }`}
                        >
                          {type.available.formatted}
                        </span>
                      </div>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>
          </GridItem>
          <GridItem>
            <label className="mb-1 font-semibold" htmlFor="leave_from">
              Leave from
            </label>
            <input
              className="h-14 p-3 border-2 border-blue-200 text-lg rounded-md outline-none focus:border-blue-500"
              type="date"
              id="leave_from"
              name="from"
              value={selectedFromDate}
              onChange={(ev) => {
                setSelectedFromDate(ev.target.value);
              }}
            />
          </GridItem>
          <GridItem id="leave_to" label="Leave To">
            <label className="mb-1 font-semibold" htmlFor="leave_to">
              Leave to
            </label>
            <input
              className="h-14 p-3 border-2 border-blue-200 text-lg rounded-md outline-none focus:border-blue-500"
              type="date"
              id="leave_to"
              name="to"
              value={selectedToDate}
              onChange={(ev) => {
                setSelectedToDate(ev.target.value);
              }}
            />
          </GridItem>
        </div>
      </form>
      <div className="flex mb-8 items-center gap-4">
        <button
          className="px-6 py-4 bg-blue-300 font-semibold rounded-md outline-none hover:bg-blue-400 active:bg-blue-500 focus:ring-2 focus:ring-blue-500"
          onClick={validateData}
        >
          Submit
        </button>
        {error && (
          <label className="inline-flex px-5 py-4 bg-red-200 text-red-900 font-semibold rounded-md items-center gap-2">
            <ExclamationCircleIcon className="w-4 h-4" />
            <span>{error}</span>
          </label>
        )}
      </div>
      <h2 className="mb-4 text-2xl font-semibold">Past requests</h2>
      {user.requests?.length ? (
        <div className="border border-blue-500 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="p-2 bg-blue-200 text-sm border-b border-blue-500"
                  align="left"
                >
                  Leave type
                </th>
                <th
                  className="p-2 bg-blue-200 text-sm border-l border-b border-blue-500"
                  align="left"
                >
                  Leave from
                </th>
                <th
                  className="p-2 bg-blue-200 text-sm border-l border-b border-blue-500"
                  align="left"
                >
                  Leave to
                </th>
                <th
                  className="p-2 bg-blue-200 text-sm border-l border-b border-blue-500"
                  align="left"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {user.requests.map((request, index) => (
                <tr key={index}>
                  <td className="p-2 text-sm">{request.type}</td>
                  <td className="p-2 text-sm border-l border-blue-500">
                    {request.from}
                  </td>
                  <td className="p-2 text-sm border-l border-blue-500">
                    {request.to}
                  </td>
                  <td className="p-2 text-sm border-l border-blue-500">
                    <div className="flex justify-between items-center">
                      <span
                        className={`${
                          request.status === "Approved"
                            ? "text-green-700"
                            : request.status === "Rejected"
                            ? "text-red-700"
                            : "text-yellow-700"
                        } font-semibold`}
                      >
                        {request.status}
                      </span>
                      {request.status === "Pending" && (
                        <button
                          className="flex px-2 py-1 rounded-md outline-none text-red-700 items-center gap-1 ring-1 ring-red-700 hover:bg-red-700 hover:text-white focus:ring-2 focus:ring-blue-500"
                          onClick={() => {
                            cancelRequest(request);
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No requests found.</p>
      )}
    </div>
  );
}

function GridItem({ className, children }) {
  return <div className={`flex flex-col ${className}`}>{children}</div>;
}

export default LeaveRequest;
