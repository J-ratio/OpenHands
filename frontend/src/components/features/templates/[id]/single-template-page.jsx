import { useParams } from "react-router";
import { getTemplate } from "../../../../api/templates";
import SingleTemplate from "./_components/SingleTemplate";
import { useState, useEffect } from "react";

const SingleTemplatePage = () => {
  const { templateId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [templateData, setTemplateData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getTemplate(templateId);
      if (result.success) {
        setTemplateData(result.data);
      } else {
        setError(result.errorMessage || "Template not found.");
      }
      setIsLoading(false);
    };
    fetchTemplate();
  }, [templateId]);

  if (isLoading) return <div className="w-full">Loading...</div>;
  if (error)
    return (
      <div className="flex items-center justify-center w-full">{error}</div>
    );
  if (!templateData)
    return (
      <div className="flex items-center justify-center w-full">
        There is no such page existed, please try again.
      </div>
    );

  return <SingleTemplate templateData={templateData} />;
};

export default SingleTemplatePage;
