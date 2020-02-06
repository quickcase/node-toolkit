const grantAccess = (type) => (http) => (caseId) => (entityId) => async (...caseRoles) => {
  const url = `/cases/${caseId}/${type}/${entityId}`;
  const body = {
    case_roles: caseRoles,
  };
  return http.put(url, body);
};

/**
 * Grant access to a case to a group.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {string|number} caseId 16-digit unique case identifier
 * @param {string} groupId Unique identifier for the group
 * @param {...string} caseRoles Case roles to be granted, at least one required
 * @return {Promise} Promise resolved when permissions updated
 */
export const grantGroupAccess = grantAccess('groups');

/**
 * Grant access to a case to a user.
 *
 * @param {httpClient} http Configured, ready-to-use HTTP client
 * @param {string|number} caseId 16-digit unique case identifier
 * @param {string} userId Unique identifier for the user
 * @param {...string} caseRoles Case roles to be granted, at least one required
 * @return {Promise} Promise resolved when permissions updated
 */
export const grantUserAccess = grantAccess('users');
