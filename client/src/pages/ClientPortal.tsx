import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ClientPortalLogin } from "@/components/ClientPortalLogin";
import { Calendar, FileText, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";

interface ProjectData {
  project: {
    id: number;
    projectName: string;
    clientName: string;
    status: string;
    startDate: Date;
    expectedEndDate: Date;
  };
  milestones: Array<{
    id: number;
    milestoneName: string;
    phase: string;
    status: string;
    completionPercentage: number;
    plannedDate: Date;
    completedDate?: Date;
  }>;
  deliverables: Array<{
    id: number;
    deliverableName: string;
    deliverableType: string;
    status: string;
    fileUrl?: string;
    fileName?: string;
    dueDate?: Date;
    deliveredDate?: Date;
  }>;
  progress: number;
  milestoneStatus: Record<string, number>;
  deliverableStatus: Record<string, number>;
}

export function ClientPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [, setLocation] = useLocation();

  // Check for existing token on mount
  useEffect(() => {
    const token = sessionStorage.getItem("clientPortalToken");
    if (token) {
      setAccessToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  const getProjectsQuery = trpc.clientPortal.getProjectsByToken.useQuery(
    { accessToken: accessToken || "" },
    { enabled: !!accessToken && isLoggedIn }
  );

  const getProjectDetailsQuery = trpc.clientPortal.getProjectDetails.useQuery(
    { projectId: selectedProject || 0, accessToken: accessToken || "" },
    { enabled: !!selectedProject && !!accessToken && isLoggedIn }
  );

  useEffect(() => {
    if (getProjectDetailsQuery.data) {
      setProjectData(getProjectDetailsQuery.data as any);
    }
  }, [getProjectDetailsQuery.data]);

  const handleLogout = () => {
    sessionStorage.removeItem("clientPortalToken");
    setAccessToken(null);
    setIsLoggedIn(false);
    setSelectedProject(null);
    setProjectData(null);
    setLocation("/");
  };

  if (!isLoggedIn || !accessToken) {
    return <ClientPortalLogin />;
  }

  const projects = getProjectsQuery.data || [];

  if (projects.length === 0 && !getProjectsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Client Portal</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <Card>
            <CardContent className="pt-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No projects found for your account.</p>
              <p className="text-sm text-gray-500 mt-2">
                Contact IMI Design at info@imidesign.in if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>{projects.length} active project(s)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {getProjectsQuery.isLoading ? (
                  <p className="text-sm text-gray-500">Loading projects...</p>
                ) : (
                  projects.map((project: any) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedProject === project.id
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{project.projectName}</p>
                      <p className="text-xs text-gray-500 mt-1">{project.clientName}</p>
                      <Badge className="mt-2 bg-green-100 text-green-800" variant="secondary">
                        {project.status}
                      </Badge>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="md:col-span-2 space-y-6">
            {!selectedProject ? (
              <Card>
                <CardContent className="pt-8 text-center">
                  <p className="text-gray-600">Select a project to view details</p>
                </CardContent>
              </Card>
            ) : getProjectDetailsQuery.isLoading ? (
              <Card>
                <CardContent className="pt-8 text-center">
                  <p className="text-gray-600">Loading project details...</p>
                </CardContent>
              </Card>
            ) : projectData ? (
              <>
                {/* Project Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>{projectData.project.projectName}</CardTitle>
                    <CardDescription>Project Overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Client</p>
                        <p className="font-semibold text-gray-900">{projectData.project.clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge className="mt-1">{projectData.project.status}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(projectData.project.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expected End</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(projectData.project.expectedEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-900">Overall Progress</p>
                        <p className="text-sm font-bold text-red-600">{projectData.progress}%</p>
                      </div>
                      <Progress value={projectData.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Project Timeline
                    </CardTitle>
                    <CardDescription>Milestone progress and status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {projectData.milestones.map((milestone) => (
                      <div key={milestone.id} className="border-l-4 border-red-600 pl-4 pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{milestone.milestoneName}</p>
                            <p className="text-xs text-gray-500 capitalize">{milestone.phase} Phase</p>
                          </div>
                          <Badge
                            className={
                              milestone.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : milestone.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(milestone.plannedDate).toLocaleDateString()}
                        </div>
                        <Progress value={milestone.completionPercentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{milestone.completionPercentage}% Complete</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Deliverables */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Deliverables
                    </CardTitle>
                    <CardDescription>Project files and documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectData.deliverables.map((deliverable) => (
                        <div
                          key={deliverable.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`p-2 rounded ${
                                deliverable.status === "delivered"
                                  ? "bg-green-100"
                                  : deliverable.status === "ready"
                                    ? "bg-blue-100"
                                    : "bg-gray-100"
                              }`}
                            >
                              {deliverable.status === "delivered" ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900">{deliverable.deliverableName}</p>
                              <p className="text-xs text-gray-500 capitalize">{deliverable.deliverableType}</p>
                              {deliverable.dueDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                deliverable.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : deliverable.status === "ready"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {deliverable.status}
                            </Badge>
                            {deliverable.fileUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(deliverable.fileUrl, "_blank")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
