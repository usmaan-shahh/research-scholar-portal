import Faculty from "../models/Faculty.js";
import Scholar from "../models/Scholar.js";

/**
 * Validates if a faculty member can accept more scholars
 * @param {string} facultyId - The faculty member's ID
 * @param {string} operation - The operation being performed ('assign', 'change', 'remove')
 * @param {string} scholarId - The scholar's ID (for change/remove operations)
 * @returns {Object} Validation result with status and details
 */
export const validateSupervisionLoad = async (
  facultyId,
  operation = "assign",
  scholarId = null
) => {
  try {
    // Get faculty member with supervision load
    const faculty = await Faculty.findById(facultyId)
      .populate("currentSupervisionLoad")
      .populate("currentCoSupervisionLoad");

    if (!faculty) {
      return {
        isValid: false,
        status: "error",
        message: "Faculty member not found",
        details: null,
      };
    }

    // Check basic eligibility
    if (!faculty.isEligibleForSupervision) {
      return {
        isValid: false,
        status: "error",
        message: faculty.eligibilityReason,
        details: {
          facultyId: faculty._id,
          facultyName: faculty.name,
          designation: faculty.designation,
          isPhD: faculty.isPhD,
          publications: faculty.numberOfPublications,
        },
      };
    }

    // Get current supervision load
    const currentLoad = faculty.totalSupervisionLoad || 0;
    const maxCapacity = faculty.maxScholars;

    // Calculate effective load based on operation
    let effectiveCurrentLoad = currentLoad;

    if (operation === "assign") {
      // Adding a new scholar
      effectiveCurrentLoad = currentLoad + 1;
    } else if (operation === "change" && scholarId) {
      // Changing supervisor - check if this faculty is currently supervising this scholar
      const currentScholar = await Scholar.findById(scholarId);
      if (currentScholar) {
        const isCurrentlySupervising =
          currentScholar.supervisor?.toString() === facultyId ||
          currentScholar.coSupervisor?.toString() === facultyId;

        if (isCurrentlySupervising) {
          // We're removing from this faculty, so the load stays the same
          effectiveCurrentLoad = currentLoad;
        } else {
          // We're adding to this faculty, so increase load by 1
          effectiveCurrentLoad = currentLoad + 1;
        }
      } else {
        // Scholar not found, treat as new assignment
        effectiveCurrentLoad = currentLoad + 1;
      }
    } else if (operation === "remove") {
      // Removing a scholar
      effectiveCurrentLoad = Math.max(0, currentLoad - 1);
    }

    // Check capacity
    if (effectiveCurrentLoad > maxCapacity) {
      return {
        isValid: false,
        status: "error",
        message: `Assignment would exceed maximum supervision capacity (${effectiveCurrentLoad}/${maxCapacity})`,
        details: {
          facultyId: faculty._id,
          facultyName: faculty.name,
          designation: faculty.designation,
          currentLoad: currentLoad,
          effectiveLoad: effectiveCurrentLoad,
          maxCapacity,
          remainingCapacity: Math.max(0, maxCapacity - currentLoad),
        },
      };
    }

    // Check if near limit (warning)
    if (maxCapacity - effectiveCurrentLoad <= 2) {
      return {
        isValid: true,
        status: "warning",
        message: `Assignment would place faculty near supervision limit (${effectiveCurrentLoad}/${maxCapacity}, ${
          maxCapacity - effectiveCurrentLoad
        } remaining)`,
        details: {
          facultyId: faculty._id,
          facultyName: faculty.name,
          designation: faculty.designation,
          currentLoad: currentLoad,
          effectiveLoad: effectiveCurrentLoad,
          maxCapacity,
          remainingCapacity: maxCapacity - effectiveCurrentLoad,
        },
      };
    }

    // Available for supervision
    return {
      isValid: true,
      status: "success",
      message: `Available for supervision (${currentLoad}/${maxCapacity}, ${
        maxCapacity - currentLoad
      } remaining)`,
      details: {
        facultyId: faculty._id,
        facultyName: faculty.name,
        designation: faculty.designation,
        currentLoad: currentLoad,
        effectiveLoad: effectiveCurrentLoad,
        maxCapacity,
        remainingCapacity: maxCapacity - currentLoad,
      },
    };
  } catch (error) {
    console.error("Error validating supervision load:", error);
    return {
      isValid: false,
      status: "error",
      message: "Error validating supervision load",
      details: null,
    };
  }
};

/**
 * Validates supervisor assignment considering both supervisor and co-supervisor
 * @param {string} supervisorId - The supervisor's ID
 * @param {string} coSupervisorId - The co-supervisor's ID (optional)
 * @param {string} operation - The operation being performed
 * @param {string} scholarId - The scholar's ID (for change operations)
 * @returns {Object} Validation result for both supervisor and co-supervisor
 */
export const validateSupervisorAssignment = async (
  supervisorId,
  coSupervisorId = null,
  operation = "assign",
  scholarId = null
) => {
  try {
    const results = {
      supervisor: null,
      coSupervisor: null,
      overallValid: true,
      warnings: [],
      errors: [],
    };

    // For change operations, we need to check if the faculty is currently supervising this scholar
    let currentSupervisorId = null;
    let currentCoSupervisorId = null;

    if (operation === "change" && scholarId) {
      const currentScholar = await Scholar.findById(scholarId);
      if (currentScholar) {
        currentSupervisorId = currentScholar.supervisor?.toString();
        currentCoSupervisorId = currentScholar.coSupervisor?.toString();
      }
    }

    // Validate supervisor
    if (supervisorId) {
      const supervisorValidation = await validateSupervisionLoad(
        supervisorId,
        operation,
        scholarId
      );
      results.supervisor = supervisorValidation;

      if (!supervisorValidation.isValid) {
        results.overallValid = false;
        results.errors.push(`Supervisor: ${supervisorValidation.message}`);
      } else if (supervisorValidation.status === "warning") {
        results.warnings.push(`Supervisor: ${supervisorValidation.message}`);
      }
    }

    // Validate co-supervisor
    if (coSupervisorId) {
      const coSupervisorValidation = await validateSupervisionLoad(
        coSupervisorId,
        operation,
        scholarId
      );
      results.coSupervisor = coSupervisorValidation;

      if (!coSupervisorValidation.isValid) {
        results.overallValid = false;
        results.errors.push(`Co-Supervisor: ${coSupervisorValidation.message}`);
      } else if (coSupervisorValidation.status === "warning") {
        results.warnings.push(
          `Co-Supervisor: ${coSupervisorValidation.message}`
        );
      }
    }

    // Check if supervisor and co-supervisor are the same person
    if (supervisorId && coSupervisorId && supervisorId === coSupervisorId) {
      results.overallValid = false;
      results.errors.push(
        "Supervisor and co-supervisor cannot be the same person"
      );
    }

    // For change operations, check if we're removing from current faculty
    if (operation === "change" && scholarId) {
      // If current supervisor is being replaced, validate that the new assignment is valid
      if (currentSupervisorId && currentSupervisorId !== supervisorId) {
        // We're removing from current supervisor, so their load will decrease
        // This should always be valid, but we can add a note
        console.log(
          `Removing scholar ${scholarId} from supervisor ${currentSupervisorId}`
        );
      }

      if (currentCoSupervisorId && currentCoSupervisorId !== coSupervisorId) {
        // We're removing from current co-supervisor, so their load will decrease
        console.log(
          `Removing scholar ${scholarId} from co-supervisor ${currentCoSupervisorId}`
        );
      }
    }

    return results;
  } catch (error) {
    console.error("Error validating supervisor assignment:", error);
    return {
      supervisor: null,
      coSupervisor: null,
      overallValid: false,
      warnings: [],
      errors: ["Error validating supervisor assignment"],
    };
  }
};

/**
 * Gets supervision load summary for a faculty member
 * @param {string} facultyId - The faculty member's ID
 * @returns {Object} Supervision load summary
 */
export const getSupervisionLoadSummary = async (facultyId) => {
  try {
    const faculty = await Faculty.findById(facultyId)
      .populate("currentSupervisionLoad")
      .populate("currentCoSupervisionLoad");

    if (!faculty) {
      return null;
    }

    return faculty.getSupervisionLoadSummary();
  } catch (error) {
    console.error("Error getting supervision load summary:", error);
    return null;
  }
};

/**
 * Gets all faculty members with their supervision load information
 * @param {string} departmentCode - Optional department filter
 * @returns {Array} Array of faculty members with supervision load details
 */
export const getFacultyWithSupervisionLoad = async (departmentCode = null) => {
  try {
    let filter = { isActive: true };
    if (departmentCode) {
      filter.departmentCode = departmentCode;
    }

    const faculty = await Faculty.find(filter)
      .populate("currentSupervisionLoad")
      .populate("currentCoSupervisionLoad")
      .select(
        "name designation departmentCode isPhD maxScholars numberOfPublications"
      );

    return faculty.map((f) => ({
      _id: f._id,
      name: f.name,
      designation: f.designation,
      departmentCode: f.departmentCode,
      isPhD: f.isPhD,
      maxScholars: f.maxScholars,
      numberOfPublications: f.numberOfPublications,
      supervisionLoad: f.getSupervisionLoadSummary(),
    }));
  } catch (error) {
    console.error("Error getting faculty with supervision load:", error);
    return [];
  }
};

/**
 * Refreshes supervision load data for specific faculty members
 * This is useful after scholar assignments change to ensure accurate data
 * @param {Array} facultyIds - Array of faculty IDs to refresh
 * @returns {Promise} Promise that resolves when refresh is complete
 */
export const refreshFacultySupervisionData = async (facultyIds) => {
  try {
    if (!facultyIds || facultyIds.length === 0) return;

    // Force a refresh by updating the faculty documents
    // This will trigger the virtual fields to recalculate
    await Promise.all(
      facultyIds.map(async (facultyId) => {
        try {
          const faculty = await Faculty.findById(facultyId);
          if (faculty) {
            // Touch the faculty document to trigger virtual field recalculation
            await faculty.save();
          }
        } catch (error) {
          console.error(`Error refreshing faculty ${facultyId}:`, error);
        }
      })
    );

    console.log(
      `Refreshed supervision data for ${facultyIds.length} faculty members`
    );
  } catch (error) {
    console.error("Error refreshing faculty supervision data:", error);
  }
};
