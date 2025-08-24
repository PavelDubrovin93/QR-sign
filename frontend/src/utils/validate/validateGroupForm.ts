export interface CreateGroupFormErrors {
  groupName: boolean;
  groupDescription: boolean;
  modalSelectedCompanyId: boolean;
}

export interface CreateGroupFormData {
  groupName: string;
  groupDescription: string;
  modalSelectedCompanyId: string | number;
}

export const validateCreateGroupForm = (
  formData: CreateGroupFormData
): { isValid: boolean; errors: CreateGroupFormErrors } => {
  let isValid = true;
  const errors: CreateGroupFormErrors = {
    groupName: false,
    groupDescription: false,
    modalSelectedCompanyId: false,
  };

  if (!formData.groupName.trim()) {
    errors.groupName = true;
    isValid = false;
  }

  if (!formData.groupDescription.trim()) {
    errors.groupDescription = true;
    isValid = false;
  }

//   if (
//     formData.modalSelectedCompanyId === "" ||
//     formData.modalSelectedCompanyId === null ||
//     formData.modalSelectedCompanyId === undefined
//   ) {
//     errors.modalSelectedCompanyId = true;
//     isValid = false;
//   }

  return { isValid, errors };
};
