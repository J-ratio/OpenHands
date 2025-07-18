"use client";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../../components/ui/card";
import {
  statusClasses,
  statusMessages,
} from "../../../../constants/styles/statusStyles";
import { cn } from "../../../../utils/utils";
import { useNavigate } from "react-router";

const TemplateCard = ({ data }) => {
  const navigate = useNavigate();
  const { id, name, status } = data;

  const { primary, secondary } =
    statusClasses[status] || statusClasses.PROCESSED;

  const handleClick = () => {
    navigate(`/template/${id}`);
  };

  return (
    <Card className={cn("flex flex-col justify-between", secondary)}>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <StatusDetail status={status} />
      </CardContent>
      <CardFooter className={cn("border-t pt-4", secondary)}>
        <Button
          variant="outline"
          onClick={handleClick}
          disabled={status !== "PROCESSED" && status !== null}
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;

const StatusDetail = ({ status }) => {
  const { text, className } = statusMessages[status] || {};

  return text ? <p className={cn("text-sm mt-2", className)}>{text}</p> : null;
};
