import { getInput, setFailed, setOutput } from "@actions/core"
import axios from "axios"
import { CodeQualityMetricName, DashboardMeta, DashboardRecord } from "./types"
import * as yaml from "js-yaml"
import * as fs from "fs"
import * as path from "path"

const ddUrl = getInput('dd-base-url')
const ddApiKey = getInput('dd-api-key')
const ddApplicationKey = getInput('dd-application-key')

/**
 * This function will solely check whether the dashboard with a given title already exist or not.
 * 
 * @param title the title of the dashboard.
 * @returns boolean true or false. True indicates dashboard with a given title already exist and vice versa.
 */
const isDashboardExist = async (title: string) => {
  const dashboards = await axios.get(`${ddUrl}/api/v1/dashboard`, {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Encoding': 'identity',
      'DD-API-KEY': ddApiKey,
      'DD-APPLICATION-KEY': ddApplicationKey
    }
  })
  if (dashboards.data == null || (dashboards.data.dashboards && dashboards.data.dashboards.length == 0)) {
    return false
  }
  const foundDashboard = dashboards.data.dashboards.filter((d: DashboardRecord) => d.title === title)
  if (foundDashboard && foundDashboard.length != 0) {
    return true
  }
}

export const convertYmlToJson = (file?: fs.PathOrFileDescriptor) => {
  if (file) {
    const obj = yaml.load(fs.readFileSync(file, { encoding: "utf-8" }))
    return JSON.stringify(obj, null, 2)
  }

  const fopen = fs.readFileSync(path.join(__dirname, "./dashboard.yml"), { encoding: "utf-8"})
  const obj = yaml.load(fopen)
  return JSON.stringify(obj, null, 2)
}

export const loadAndBuildDashboard = async (
  dashboardInfo: DashboardMeta, codeMetricNames: CodeQualityMetricName,
  file?: fs.PathOrFileDescriptor
) => {
  let jsonPayload = convertYmlToJson(file)

  jsonPayload = jsonPayload.replaceAll("${title}", dashboardInfo.title)
  jsonPayload = jsonPayload.replaceAll("${author}", dashboardInfo.author)
  jsonPayload = jsonPayload.replaceAll("${date}", new Date().toISOString())
  jsonPayload = jsonPayload.replaceAll("${sonarBaseUrl}", dashboardInfo.sonarBaseUrl)
  jsonPayload = jsonPayload.replaceAll("${componentName}", dashboardInfo.componentName)
  jsonPayload = jsonPayload.replaceAll("${coverage_metric_name}", codeMetricNames.coverage)
  jsonPayload = jsonPayload.replaceAll("${smells_metric_name}", codeMetricNames.smells)
  jsonPayload = jsonPayload.replaceAll("${vulnerabilities_metric_name}", codeMetricNames.vulnerabilities)
  jsonPayload = jsonPayload.replaceAll("${security_hotspots_metric_name}", codeMetricNames.securityHotspots)
  jsonPayload = jsonPayload.replaceAll("${duplines_density_metric_name}", codeMetricNames.dupLinesDensity)

  const response = await axios.post(`${ddUrl}/api/v1/dashboard`, jsonPayload, {
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Encoding': 'identity',
      'DD-API-KEY': ddApiKey,
      'DD-APPLICATION-KEY': ddApplicationKey
    }
  })

  setOutput('status', response.status)
  setOutput('data', response.data)
}

const bootstrap = async() => {
  try {
    const title = getInput('dashboard-title') 
    const author = getInput('dashboard-author') 
    const sonarBaseUrl = getInput('sonar-base-url') 
    const componentName = getInput('component-name')
    
    const dashboardExist = await isDashboardExist(title)
    if (dashboardExist) {
      // If the same dashboard exist, then we'll just skip to create the same dashboard twice
      throw new Error(`Dashboard ${title} already exist. Process exit(1)!`)
    }

    const pattern = /[-$.+#)]/g

    const coverage = `${componentName.replaceAll(pattern, '_')}_coverage`
    const smells = `${componentName.replaceAll(pattern, '_')}_code_smells`
    const vulnerabilities = `${componentName.replaceAll(pattern, '_')}_vulnerabilities`
    const securityHotspots = `${componentName.replaceAll(pattern, '_')}_security_hotspots`
    const dupLinesDensity = `${componentName.replaceAll(pattern, '_')}_duplicated_lines_density`

    await loadAndBuildDashboard(
      { title, author, sonarBaseUrl, componentName },
      { coverage, smells, vulnerabilities, securityHotspots, dupLinesDensity }
    )
  } catch(error: any) {
    setFailed(error?.message)
  }
}

export default bootstrap