/** Catalog item availability */
export const ITEM_STATUS = Object.freeze({
  AVAILABLE: "Available",
  BORROWED: "Borrowed",
  UNAVAILABLE: "Unavailable",
});

export const ITEM_STATUS_VALUES = Object.freeze(Object.values(ITEM_STATUS));

/** Manual lender toggles (not while Borrowed) */
export const ITEM_TOGGLE_STATUS = Object.freeze([
  ITEM_STATUS.AVAILABLE,
  ITEM_STATUS.UNAVAILABLE,
]);

/** Borrow request lifecycle */
export const BORROW_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  AGREEMENT_PENDING: "agreement_pending",
  REJECTED: "rejected",
  BORROWED: "borrowed",
  RETURNED: "returned",
  RATED: "rated",
  CANCELLED: "cancelled",
});

export const BORROW_STATUS_VALUES = Object.freeze(Object.values(BORROW_STATUS));

/**
 * Who may trigger a transition: 'lender' | 'borrower' | 'system'
 * Value = next status.
 */
export const BORROW_TRANSITIONS = Object.freeze({
  [BORROW_STATUS.PENDING]: {
    lender: [BORROW_STATUS.APPROVED, BORROW_STATUS.REJECTED],
    borrower: [BORROW_STATUS.CANCELLED],
  },
  [BORROW_STATUS.APPROVED]: {
    lender: [BORROW_STATUS.AGREEMENT_PENDING],
  },
  [BORROW_STATUS.AGREEMENT_PENDING]: {
    borrower: [BORROW_STATUS.BORROWED],
  },
  [BORROW_STATUS.BORROWED]: {
    lender: [BORROW_STATUS.RETURNED],
  },
  [BORROW_STATUS.RETURNED]: {
    // both parties rate; status becomes rated when both done (service logic)
    lender: [BORROW_STATUS.RATED],
    borrower: [BORROW_STATUS.RATED],
  },
});

/**
 * @param {string} current
 * @param {string} next
 * @param {'lender'|'borrower'} actor
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function canTransitionBorrow(current, next, actor) {
  const from = BORROW_TRANSITIONS[current];
  if (!from) {
    return { ok: false, message: `No transitions from status '${current}'.` };
  }
  const allowed = from[actor] || [];
  if (!allowed.includes(next)) {
    return {
      ok: false,
      message: `Cannot move from '${current}' to '${next}' as ${actor}.`,
    };
  }
  return { ok: true };
}

/**
 * Competing requests auto-rejected when one loan starts.
 */
export const COMPETING_STATUSES = Object.freeze([
  BORROW_STATUS.PENDING,
  BORROW_STATUS.APPROVED,
]);
