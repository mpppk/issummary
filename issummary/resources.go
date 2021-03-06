package issummary

import (
	"github.com/mpppk/gitany"
)

type WorkRelation struct {
	LabelName string
	Type      WorkRelationType
}

type WorkRelationType string

const (
	NoneRelation                    WorkRelationType = "None"
	IssueOfIssueDescriptionRelation                  = "IssueOfIssueDescription"
	LabelOfIssueDescriptionRelation                  = "LabelOfIssueDescription"
	LabelOfLabelDescriptionRelation                  = "LabelOfLabelDescription"
	UnknownRelation                                  = "Unknown"
)

type Label struct {
	gitany.Label
	Description  *LabelDescription
	ParentLabels []*Label
}

type LabelDescription struct {
	Raw              string
	DependLabelNames []string `json:"deps"`
	ParentName       string   `json:"parent"` // TODO: 複数の親を持てるようにする
}

type Issue struct {
	gitany.Issue
	Description *IssueDescription
	ProjectName string
	GroupName   string
	Milestone   *Milestone
}

func (i *Issue) GetMilestone() *Milestone {
	return toMilestone(i.Issue.GetMilestone())
}

func (i *Issue) ListDependencies() *IssueDependencies {
	workDependencies := &IssueDependencies{}
	issueDependencies := i.Description.Dependencies
	for _, dependIssue := range issueDependencies.Issues {
		newDependIssue := &DependIssue{
			GroupName:   dependIssue.GroupName,
			ProjectName: dependIssue.ProjectName,
			Number:      dependIssue.Number,
		}

		if newDependIssue.GroupName == "" {
			newDependIssue.GroupName = i.GroupName
		}

		if newDependIssue.ProjectName == "" {
			newDependIssue.ProjectName = i.ProjectName
		}

		if newDependIssue.Number == 0 {
			newDependIssue.Number = i.GetNumber()
		}

		workDependencies.Issues = append(workDependencies.Issues, newDependIssue)
	}
	workDependencies.LabelNames = issueDependencies.LabelNames
	return workDependencies
}

func (i *Issue) HasLabel(labelName string) bool {
	for _, issueLabelName := range i.GetLabels() {
		if issueLabelName == labelName {
			return true
		}
	}
	return false
}

func (i *Issue) HasAllLabels(labelNames []string) bool {
	for _, labelName := range labelNames {
		if !i.HasLabel(labelName) {
			return false
		}
	}
	return true
}

type Repository struct {
	gitany.Repository
}

type IssueDescription struct {
	Raw          string
	Dependencies *IssueDependencies
	Summary      string
	Note         string
	Details      string
}

type IssueDependencies struct { // FIXME merge Dependencies
	Issues     []*DependIssue
	LabelNames []string
}

type DependIssue struct {
	GroupName   string
	ProjectName string
	Number      int
}

type Work struct {
	Relation        *WorkRelation
	Repository      *Repository
	Issue           *Issue
	Label           *Label
	DependWorks     []*Work
	StoryPoint      int
	TotalStoryPoint int
	ManDay          int
	TotalManDay     int
	RemainManDays   int
}

func (w *Work) GetTotalStoryPoint() (totalSP int) {
	for _, dWork := range w.DependWorks {
		totalSP += dWork.StoryPoint
	}
	return
}

type DependWork struct {
	Work *Work
}
