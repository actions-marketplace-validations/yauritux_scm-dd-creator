export enum LayoutType {
  ORDERED = "ordered",
  FREE = "free"
}

export enum ReflowType {
  AUTO = "auto",
  FIXED = "fixed"
}

export type DashboardMeta = {
  title: string
  author: string
  sonarBaseUrl: string
  componentName: string
}

export type CodeQualityMetricName = {
  coverage: string
  smells: string
  vulnerabilities: string
  securityHotspots: string
  dupLinesDensity: string
}

export type DashboardRecord = {
  id: string
  title: string
  description: string
  layout_type: LayoutType
  url: string
  is_read_only: boolean
  created_at: string,
  modified_at: string | null,
  author_handle: string,
  deleted_at: string | null  
}

export type TemplateVariablePreset = {
  name: string
  template_variables?: {
    name: string
    /**
     * One or many template variable values within the saved view, which will be
     * unioned together using <code>OR</code> if more than one is specified.
     */
    values: string[]
  }[]
}

export type TemplateVariables = {
  /**
   * The name of the variable.
   */
  name: string
  /**
   * The tag prefix associated with the variable. Only tags with this prefix appear
   * in the variable drop-down.
   */
  prefix?: string
  /**
   * The list of values that the template variable drop-down is limited to.
   */
  available_values?: string[]
  /**
   * One or many default values for template variables on load. 
   * If more than one default is specified, they will be unioned together with <code>OR</code>.
   */
  defaults?: string[]
}

export type DashboardWidget = {
  id?: number
  /**
   * one of widget as explained [here](https://docs.datadoghq.com/dashboards/widgets/).
   */
  definition: object
  /**
   * The layout of a widget on a <code>free</code> or <strong>new dashboard layout</strong> dashboard.
   */
  layout: {
    /**
     * The height of the widget. Should be a non-negative integer.
     */
    height: number
    /**
     * Whether the widget should be the first one on the second column in high density or not.
     * <strong>Note</strong>: Only for the <strong>new dashboard layout</strong> and only one 
     * widget in the dashboard should have this property set to <code>true</code>.
     */
    is_column_break?: boolean
    /**
     * The width of the widget. Should be a non-negative integer.
     */
    width: number
    /**
     * The position of the widget on the x (horizontal) axis. Should be a non-negative integer.
     */
    x: number
    /**
     * The position of the widget on the y (vertical) axis. Should be a non-negative integer.
     */
    y: number
  }
}

export type CreateDashboardPayload = {
  /**
   * Title of the dashboard
   */
  title: string
  author_handle?: string
  created_at?: Date
  description?: string
  layout_type: LayoutType
  notify_list?: string[]
  /**
   * Reflow type for a <strong>new dashboard layout</strong> dashboard. Set this only 
   * when layout type is <code>ordered</code>. If set to <code>fixed</code>, the dashboard 
   * expects all widgets to have a layout, and if it's set to <code>auto</code>, 
   * widgets should have no layouts.
   */
  reflow_type?: ReflowType
  /**
   * A list of role identifiers. Only the author and users associated with at least 
   * one of these roles can edit the dashboard.
   */
  retriscted_roles?: string[]
  /**
   * List of team names representing ownership of the dashboard.
   */
  tags?: string[]
  /**
   * Array of template variable saved views.
   */
  template_variable_presets?: TemplateVariablePreset[]
  /**
   * List of template variables for this dashboard.
   */
  template_variables?: TemplateVariables[]
  /**
   * List of widgets to be displayed on the dashboard.
   * A widget can be embedded into another widget (nested widget).
   */
  widgets: DashboardWidget[]
}