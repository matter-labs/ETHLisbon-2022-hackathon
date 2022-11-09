import {useState} from "react";
import {useAppDispatch} from "./reduxHooks";
import parseGithubUrl from "parse-github-url";
import {Octokit} from "@octokit/rest";
import {PullRequest, PullRequestContributor, PullRequestState} from "../utils/ProjectTypes/Project.types";
import {githubReducerActions} from "../store/reducers/github";

const loadPullRequestInformation = async (
    params: {repoOwner: string, repoName: string, pullRequestNumber: number}): Promise<PullRequest> => {
  // run the GET calling the github sdk
  const octokit = new Octokit({});
  const pullRequestInformation = await octokit.rest.pulls.get({
    owner: params.repoOwner, repo: params.repoName, pull_number: params.pullRequestNumber});
  const commitsInformation = await octokit.rest.pulls.listCommits({
    owner: params.repoOwner, repo: params.repoName, pull_number: params.pullRequestNumber});
  const commits: {authorId: number, message: string, sha: string, url: string}[] =
      commitsInformation.data.map(commit => {
        return {authorId: commit.author.id, sha: commit.sha, message: commit.commit.message, url: commit.url};});
  // get unique contributors from commits
  const uniqueContributors: number[] = Array.from(new Set(commits.map(commit => {return commit.authorId; } )).values());
  const contributors: PullRequestContributor[] = [];
  uniqueContributors.forEach(contributorId => {
    let contributorInformation = commitsInformation.data.filter(contributor => { return contributor.author.id })[0];
    contributors.push({
      id: contributorId,
      username: contributorInformation.author.login as string,
      avatarUrl: contributorInformation.author.avatar_url as string,
      profileUrl: contributorInformation.author.url as string,
      commits: commits.filter(commit => { return commit.authorId === contributorId; }).map(commit => {
        return { message: commit.message, sha: commit.sha, url: commit.url };
      })
    });
  });
  return {
    id: pullRequestInformation.data.id,
    title: pullRequestInformation.data.title,
    closedAt: Math.round(new Date(pullRequestInformation.data.closed_at).getTime() / 1000),
    state: pullRequestInformation.data.state as PullRequestState,
    contributors: contributors
  } as PullRequest;
}

export const useGetPullRequestDetails = () => {
  const [status, setStatus] = useState<{
    loading: boolean,
    error: string,
    pullRequestUrl: string,
  }>({loading: false, error: "", pullRequestUrl: ""});
  const dispatch = useAppDispatch();
  const checkNow = (pullRequestUrl: string) => {
    setStatus({loading: true, error: "", pullRequestUrl: ""});
    const pullRequestInformation = parseGithubUrl(pullRequestUrl);
    console.log(pullRequestInformation);
    if (pullRequestInformation.branch !== null && pullRequestInformation.branch === "pull") {
      loadPullRequestInformation({
        repoOwner: pullRequestInformation.owner,
        repoName: pullRequestInformation.name,
        pullRequestNumber: parseInt(pullRequestInformation.filepath)
      }).then(pullRequest => {
        dispatch(githubReducerActions.setPullRequest(pullRequest));
      });
      setStatus({loading: false, error: "", pullRequestUrl: pullRequestUrl});
    } else setStatus({loading: false, error: "Invalid pull request URL", pullRequestUrl: ""});
  }
  return {
    ...status, checkNow
  }
}
