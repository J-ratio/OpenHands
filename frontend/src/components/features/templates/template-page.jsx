"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { createTemplate, getAllTemplates } from "../../../api/templates";
import { Button } from "../../../components/ui/button";
import { NEW_TEMPLATE_DATA } from "../../../constants/data/data";
import TemplateCard from "./_components/TemplateCard";
import CreateTemplateUsingFile from "./_components/CreateTemplateUsingFile";

const TemplatePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function getData() {
    setLoading(true);
    const data = await getAllTemplates();
    if (data.success) {
      setData(data.data);
    } else {
      setError(data.errorMessage);
    }
    setLoading(false);
  }

  async function handleCreateNewTemplate() {
    const res = await createTemplate(
      NEW_TEMPLATE_DATA.title,
      NEW_TEMPLATE_DATA.description,
      NEW_TEMPLATE_DATA.content,
    );

    if (res.success && res.data) {
      toast.success("Template created successfully");

      if (res?.data && res?.data?.id) {
        setTimeout(() => {
          navigate(`/template/${res?.data?.id}`);
        }, 1000);
      }
    } else {
      console.log("TEMPLATE CREATION FAILED", res.errorMessage);
      toast.error("Failed to create a template");
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-400 dark:border-neutral-700 bg-logo dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full py-12 overflow-y-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Templates</h2>
            <CreateTemplateUsingFile />
            <Button onClick={handleCreateNewTemplate}>Create a Template</Button>
          </div>
          {loading ? (
            <div className="text-lg text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-lg text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.length === 0 && (
                <div className="text-lg text-gray-500">No templates found</div>
              )}
              {data?.map((template, _idx) => (
                <TemplateCard key={"template-" + _idx} data={template} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatePage;
