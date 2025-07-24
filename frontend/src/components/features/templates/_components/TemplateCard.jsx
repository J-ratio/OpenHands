"use client";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../../components/ui/card";
import {
  statusClasses,
  statusMessages,
} from "../../../../constants/styles/statusStyles";
import { cn } from "../../../../utils/utils";
import { useNavigate } from "react-router";
import { deleteTemplate } from "../../../../api/templates";
import { ConfirmationModal } from "../../../shared/modals/confirmation-modal";
import { toast } from "sonner";

const TemplateCard = ({ data, onDeleteTemplate }) => {
  const navigate = useNavigate();
  const { id, name, status } = data;

  const { primary, secondary } =
    statusClasses[status] || statusClasses.PROCESSED;

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState(null);

  const handleViewClick = () => {
    navigate(`/template/${id}`);
  };

  const handleDelete = async (id) => {
    const { success, errorMessage } = await deleteTemplate(id);
    if (success) {
      toast.success("Template deleted successfully");
      if (onDeleteTemplate) onDeleteTemplate();
    } else {
      toast.error(errorMessage || "Failed to delete a tempalte");
    }
  };

  const handleDeleteClick = (id, name) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId) {
      await handleDelete(confirmDeleteId);
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  };

  return (
    <Card className={cn("flex flex-col justify-between", secondary)}>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <StatusDetail status={status} />
      </CardContent>
      <CardFooter
        className={cn("flex justify-end gap-4", "border-t pt-4", secondary)}
      >
        <Button
          variant="outline"
          onClick={handleViewClick}
          disabled={status !== "PROCESSED" && status !== null}
        >
          View
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDeleteClick(data.id, data.name)}
          disabled={status !== "PROCESSED" && status !== null}
        >
          Delete
        </Button>
        {confirmDeleteId && (
          <ConfirmationModal
            text={`Are you sure you want to delete ${confirmDeleteName}?`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;

const StatusDetail = ({ status }) => {
  const { text, className } = statusMessages[status] || {};

  return text ? <p className={cn("text-sm mt-2", className)}>{text}</p> : null;
};
