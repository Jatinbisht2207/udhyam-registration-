import React from 'react';

const STEPS = [
  { id: 1, label: 'Aadhaar' },
  { id: 2, label: 'OTP' },
  { id: 3, label: 'PAN' },
];

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ProgressBar({ currentStep = 1 }) {
  return (
    <nav aria-label="Registration progress" className="w-full px-2">
      <ol className="flex items-center justify-between" role="list">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex flex-col items-center gap-2 w-full">
                {/* Step circle */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-md'
                      : isCurrent
                        ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                  role="img"
                  aria-label={
                    isCompleted
                      ? `Step ${step.id}: ${step.label} – completed`
                      : isCurrent
                        ? `Step ${step.id}: ${step.label} – current`
                        : `Step ${step.id}: ${step.label} – upcoming`
                  }
                >
                  {isCompleted ? <CheckIcon /> : step.id}
                </div>

                {/* Step label */}
                <span
                  className={`text-xs font-medium text-center transition-colors duration-300 ${
                    isCompleted
                      ? 'text-green-600'
                      : isCurrent
                        ? 'text-blue-700 font-semibold'
                        : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (between steps, not after last) */}
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-full mx-2 -mt-6 transition-colors duration-300 ${
                    step.id < currentStep ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default ProgressBar;
