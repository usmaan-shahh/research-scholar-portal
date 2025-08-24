import Faculty from "../models/Faculty.js";
import Scholar from "../models/Scholar.js";

export const validateSupervisionLoad = async (
  facultyId,
  operation = "assign",
  scholarId = null
) => {
  try {
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

    const currentLoad = faculty.totalSupervisionLoad || 0;
    const maxCapacity = faculty.maxScholars;

    let effectiveCurrentLoad = currentLoad;

    if (operation === "assign") {
      effectiveCurrentLoad = currentLoad + 1;
    } else if (operation === "change" && scholarId) {
      const currentScholar = await Scholar.findById(scholarId);
      if (currentScholar) {
        const isCurrentlySupervising =
          currentScholar.supervisor?.toString() === facultyId ||
          currentScholar.coSupervisor?.toString() === facultyId;

        if (isCurrentlySupervising) {
          effectiveCurrentLoad = currentLoad;
        } else {
          effectiveCurrentLoad = currentLoad + 1;
        }
      } else {
        effectiveCurrentLoad = currentLoad + 1;
      }
    } else if (operation === "remove") {
      effectiveCurrentLoad = Math.max(0, currentLoad - 1);
    }

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

    let currentSupervisorId = null;
    let currentCoSupervisorId = null;

    if (operation === "change" && scholarId) {
      const currentScholar = await Scholar.findById(scholarId);
      if (currentScholar) {
        currentSupervisorId = currentScholar.supervisor?.toString();
        currentCoSupervisorId = currentScholar.coSupervisor?.toString();
      }
    }

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

    if (supervisorId && coSupervisorId && supervisorId === coSupervisorId) {
      results.overallValid = false;
      results.errors.push(
        "Supervisor and co-supervisor cannot be the same person"
      );
    }

    if (operation === "change" && scholarId) {
      if (currentSupervisorId && currentSupervisorId !== supervisorId) {
        console.log(
          `Removing scholar ${scholarId} from supervisor ${currentSupervisorId}`
        );
      }

      if (currentCoSupervisorId && currentCoSupervisorId !== coSupervisorId) {
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

export const getFacultyWithSupervisionLoad = async (departmentCode = null) => {
  try {
    let filter = { isActive: true };
    if (departmentCode) {
      filter.departmentCode = departmentCode;
    }

    const faculty = await Faculty.find(filter)
      .populate("currentSupervisionLoad")
      .populate("currentCoSupervisionLoad")
      .populate("userAccountId", "name email role")
      .select(
        "name designation departmentCode isPhD maxScholars numberOfPublications userAccountId"
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
      userId: f.userAccountId?._id, // Add userId for backward compatibility
      hasUserAccount: !!f.userAccountId,
    }));
  } catch (error) {
    console.error("Error getting faculty with supervision load:", error);
    return [];
  }
};

export const refreshFacultySupervisionData = async (facultyIds) => {
  try {
    if (!facultyIds || facultyIds.length === 0) return;

    await Promise.all(
      facultyIds.map(async (facultyId) => {
        try {
          const faculty = await Faculty.findById(facultyId);
          if (faculty) {
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
