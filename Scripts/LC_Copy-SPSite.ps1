#Requires -Version 4.0
#Requires -PSSnapin Microsoft.SharePoint.PowerShell
#Requires -Modules ActiveDirectory
#Requires -RunAsAdministrator

if ( (Get-PSSnapin -Name Microsoft.SharePoint.PowerShell -ErrorAction SilentlyContinue) -eq $null )
{
    Add-PsSnapin Microsoft.SharePoint.PowerShell
}

function Save-SPWebToXml
{
<#
.SYNOPSIS
This script records the details of a SharePoint web into an xml file

.DESCRIPTION
The purpose of this script is to download the details of a 
Microsoft.SharePoint.SPWeb object into a given XML file. 
That XML file can then be used to recreate the web. The download will
include files which will be downloaded into directories at the given path.

.PARAMETER url
The web that should be recorded. The script will also include all sub-webs recursivly

.PARAMETER xmlDocument
This is the main XML document that will store the data. This xml document should have
a root node with an attribute "path" that has the xml file location on the computer. Here
is a sample structure:

<structure path="C:\out\xmlFile.xml">
    <site>

    </site>
</structure

.PARAMETER parentElement
Optionally include the parent element that this SPWeb will be recorded under.
If no parent element is specified then the web will be created under the top node.

.EXAMPLE

.LINK
LC-Add-List

.LINK
LC-Download-Libraries

.LINK
LC-Add-Web

#>


    [CmdletBinding()]
    Param(
    [string]$url,
    [System.Xml.XMLDocument]$xmlDocument,
    [System.Xml.XMLElement]$parentElement
    )

    $xmlLocation = ($xmlDocument.FirstChild.path)
    $parentFilesystemPath = $xmlLocation.Substring(0,$xmlLocation.LastIndexOf("\"))

    Write-Host "Recoding details of web: $url"
    $web = Get-SPWeb $url

    # The publishing version of the web contains navigation settings
    Write-Debug "Trying to get the publishing version of the web..."
    $publishingWeb = [Microsoft.SharePoint.Publishing.PublishingWeb]::GetPublishingWeb($web)
    $pubWebNavigation = $publishingWeb.Navigation

    # The relative web will be used to understand where we are in the
    # file system path. This is mostly used when downloading the web libraries
    $relativeUrl = ($web.Url).Substring($web.Url.LastIndexOf("/"))
    Write-Debug "The relative path of $web is $relativeUrl"
    $currentFilesystemPath = $parentFilesystemPath+($relativeUrl.Replace("/","\"))
    Write-Debug "The new file system path is: $currentFilesystemPath"

    # We need to record the web details including navigation settings
    Write-Debug "Creating new element in specified XML document"
    $xmlWeb = $xmlDocument.CreateElement("web")
    Write-Debug "Adding Attributes"
    $xmlWeb.SetAttribute("name", $web.Name)
    $xmlWeb.SetAttribute("title", $web.Title)
    $xmlWeb.SetAttribute("url", $relativeUrl)
    $xmlWeb.SetAttribute("template", $web.WebTemplate+"#"+$web.Configuration)
    $xmlWeb.SetAttribute("inheritglobal", $pubWebNavigation.InheritGlobal)
    $xmlWeb.SetAttribute("inheritcurrent", $pubWebNavigation.InheritCurrent)
    $xmlWeb.SetAttribute("globalincludesubsites", $pubWebNavigation.GlobalIncludeSubSites)
    $xmlWeb.SetAttribute("globalincludepages", $pubWebNavigation.GlobalIncludePages)
    $xmlWeb.SetAttribute("currentshowsiblings", $pubWebNavigation.ShowSiblings)
    $xmlWeb.SetAttribute("currentincludesubsites", $pubWebNavigation.CurrentIncludeSubSites)
    $xmlWeb.SetAttribute("currentincludepages", $pubWebNavigation.CurrentIncludePages)

    $parentElement.AppendChild($xmlWeb)

    # Get all the list details so we can recreate later
    # TODO
    #foreach ($list in $web.Lists)
    #{
    #    LC-Add-List -list $list -xmlDocument $xmlDocument -ParentElement $xmlWeb
    #}

    # This will download all the libraries on the current web including the files
    # but is it currently limited to only default libraries. It will not create new libraries
    Save-SPLibrariesToXml -web $web -rootPath $currentFilesystemPath -parentElement $xmlWeb

    # We need to iterate through all the sub webs and do it all over again!
    foreach ($subweb in $web.Webs)
    {
        Save-SPWebToXml -url $subweb.Url -xmlDocument $xmlDocument -parentElement $xmlWeb -parentFilesystemPath $currentFilesystemPath
    }

    $web.dispose()
}

function Save-SPListToXml
{
    Param(
    [Microsoft.SharePoint.SPList]$list,
    [System.Xml.XMLDocument]$xmlDocument,
    [System.Xml.XMLElement]$parentElement
    )

    Write-Host "Getting list $($list.Title)"

    $features = [Microsoft.SharePoint.Administration.SPFarm]::Local

    $feature = $features[$list.TemplateFeatureId]

    $xmlList = $xmlDocument.CreateElement("list")
    $xmlList.SetAttribute("name", $list.Title)
    $xmlList.SetAttribute("description", $list.Description)
    $xmlList.SetAttribute("url", ($list.RootFolder.ServerRelativeUrl).Substring($list.RootFolder.ServerRelativeUrl.LastIndexOf("/")))
    $xmlList.SetAttribute("featureid", $list.TemplateFeatureID)
    $xmlList.SetAttribute("basetemplate", $list.BaseTemplate)
    $xmlList.SetAttribute("doctemplatetype", "100")

    foreach($field in $list.Fields)
    {
        if($field.FromBaseType.ToString() -eq "False")
        {
            $xmlField = $xmlDocument.CreateElement("field")
            $xmlField.SetAttribute("name", $field.StaticName)
            $xmlField.SetAttribute("title", $field.Title)
            $xmlField.SetAttribute("xml", $field.SchemaXml)
            $xmlList.AppendChild($xmlField)
        }
    }


    $parentElement.AppendChild($xmlList)


}

function Save-SPSiteToXml
{
Param
(
[string]$destination
)



    $scriptName = "CopySite"
    $startDate = Get-Date
    $workingDirectory = "E:\out\$($scriptName)-$($startDate.ToFileTime())"
    $inputDirectory = "C:\input\Migration"
    $filename = "$workingDirectory\output.xml"
    $outputXml = "output-$($startDate.ToFileTime())"
    $rootSite = "https://test.mednet.med.ubc.ca"

    $xmlTemplate = @"
    <sitestructure path="$filename" input="$inputDirectory">
    </sitestructure>
"@



    if((Test-Path $workingDirectory) -ne $true) {New-Item $workingDirectory -ItemType directory}

    # Create XML from template
    $xmlTemplate | Out-File $filename

    $xml = New-Object XML
    $xml.Load($filename)

    $site = Get-SPSite $rootSite

    ##
    # Get site owner. If site owner no longer exists in AD then use current user (the person running this script)
    ##
    if((Get-ADUser -ErrorAction SilentlyContinue -Identity $site.Owner.UserLogin.Substring($site.Owner.UserLogin.LastIndexOf('\')+1) | Where {$_.Enabled -match "True"}) -eq $null)
    {
        $owner = "fom\"+[Environment]::UserName
        $ownerEmail = (Get-ADUser ($owner.Substring(4)) -Properties mail).mail
    }
    else
    {
        $owner = $site.Owner.UserLogin.Substring($site.Owner.UserLogin.LastIndexOf('|')+1)
        $ownerEmail = $site.Owner.Email
    }
    $xml.FirstChild

    $xmlSite = $xml.CreateElement("site")
    $xmlSite.SetAttribute("name", $site.RootWeb.Name)
    $xmlSite.SetAttribute("title", $site.RootWeb.Title)
    $xmlSite.SetAttribute("url", $site.RootWeb.URL)
    $xmlSite.SetAttribute("template", $site.RootWeb.WebTemplate+"#"+$site.RootWeb.Configuration)
    $xmlSite.SetAttribute("description", $site.RootWeb.DescriptionL)
    $xmlSite.SetAttribute("ownerAlias", $owner)
    $xmlSite.SetAttribute("ownerEmail", $ownerEmail)
    if(![string]::IsNullOrEmpty($destination)){$xmlSite.SetAttribute("destination", $destination)} 
    $xml.FirstChild.AppendChild($xmlSite)

    foreach ($list in $site.RootWeb.Lists)
    {
        Save-SPListToXml -list $list -xmlDocument $xml -parentElement $xmlSite
    }

    $rootPath = $filename.Substring(0,$filename.LastIndexOf("\"))

    Save-SPLibrariesToXml -web $site.RootWeb -rootPath $rootPath -parentElement $xmlSite

    foreach ($web in $site.RootWeb.Webs)
    {
        if($web.Url -ne $site.Url)
        {
            #LC-Add-Web -url $web.Url -xmlDocument $xml -parentElement $xmlSite -parentFilesystemPath $rootPath
            Save-SPWebToXml -url $web.Url -xmlDocument $xml -parentElement $xmlSite
        }
    }

    $xml.Save($filename)

    New-SPSiteFromXml -xmlPath $filename
}

function New-SPSiteFromXml
{
    Param
    (
    [string]$xmlPath
    )

    ##########################
    #                        #
    # Set up directory & XML #
    #                        #  
    ##########################

    $xml = New-Object XML
    $xml.Load($xmlPath)



    foreach($xmlSite in $xml.sitestructure.site)
    {
        Write-Debug "Starting to create new site: $($xmlSite.name)"
        if([string]::IsNullOrEmpty(($destination = $xmlSite.destination)))
        {
            $destination = $xmlSite.url
            Write-Debug "The destination will be: $($destination)"
        }

        $newSite = New-SPSite -Name $xmlSite.title -Url $destination -Template $xmlSite.template -Description $xmlSite.description -OwnerAlias $xmlSite.ownerAlias -OwnerEmail $xmlSite.ownerEmail -CompatibilityLevel 15

        Sync-SPBrandingFiles -inputDirectory $xml.sitestructure.input -site $newSite

        $newSite.RootWeb.CustomMasterUrl = "$($newSite.RootWeb.ServerRelativeUrl)/_catalogs/masterpage/MedNetPublishing.master"
        $newSite.RootWeb.MasterUrl = "$($newSite.RootWeb.ServerRelativeUrl)/_catalogs/masterpage/MedNetPublishing.master"
        $newSite.RootWeb.Update()

        New-SPLibrariesFromXml -web $newSite.RootWeb -parentElement $xmlSite

        foreach($xmlWeb in $xmlSite.web)
        {
            #LC-New-Web -url $destination -parentElement $xmlWeb
        }
    }

}

function New-SPWebFromXml
{
    Param(
    [string]$url,
    [System.Xml.XMLElement]$parentElement
    )

    $newUrl = $($url)+$($parentElement.url)

    Write-Debug "Creating new web: $($parentElement.title)"
    Write-Debug "New web url: $newUrl"
    Write-Debug "New web template: $($parentElement.template)"
    $newWeb = New-SPWeb -Url $newUrl -Template $parentElement.template -Name $parentElement.title
    $newWeb.Title = $parentElement.title
    $newWeb.Update()
    $publishingWeb = [Microsoft.SharePoint.Publishing.PublishingWeb]::GetPublishingWeb($newWeb)

    $publishingWeb.Navigation.InheritGlobal = [System.Convert]::ToBoolean($parentElement.inheritglobal)
    $publishingWeb.Navigation.InheritCurrent = [System.Convert]::ToBoolean($parentElement.inheritcurrent)
    $publishingWeb.Navigation.GlobalIncludeSubSites = [System.Convert]::ToBoolean($parentElement.globalincludesubsites)
    $publishingWeb.Navigation.GlobalIncludePages = [System.Convert]::ToBoolean($parentElement.globalincludepages)
    $publishingWeb.Navigation.ShowSiblings = [System.Convert]::ToBoolean($parentElement.currentshowsiblings)
    $publishingWeb.Navigation.CurrentIncludeSubSites = [System.Convert]::ToBoolean($parentElement.currentincludesubsites)
    $publishingWeb.Navigation.CurrentIncludePages = [System.Convert]::ToBoolean($parentElement.currentincludepages)

    $publishingWeb.Update()

    New-SPLibrariesFromXml -web $newWeb -parentElement $parentElement


    foreach($xmlWeb in $parentElement.web)
    {
        New-SPWebFromXml -url $newUrl -parentElement $xmlWeb
    }

}

function Save-SPLibrariesToXml
{
Param
(
[Microsoft.SharePoint.SPWeb] $web,
[string] $rootPath,
[System.Xml.XMLElement]$parentElement
)

    $blackList= {}.Invoke()

    $blacklist.Add("Theme Gallery")
    $blacklist.Add("Theme Gallery")
    $blacklist.Add("Spelling")
    $blacklist.Add("Style Library")
    $blacklist.Add("Master Page Gallery")
    $blacklist.Add("Maintenance Log Library")
    $blacklist.Add("List Template Gallery")
    $blacklist.Add("Converted Forms")
    $blacklist.Add("TimerJobLogs")
    $blacklist.Add("Web Part Gallery")

    

    foreach($list in $web.Lists)
    {

        $folder = $web.GetFolder($list)

        # Create query object

        $query = New-Object Microsoft.SharePoint.SPQuery

        $query.Folder = $folder

        $itemCollection = $list.GetItems($query)

        if(!$blackList.Contains($list.Title))
        {

            if(($itemCollection.Count -gt 0) -and ($list.BaseType -eq "DocumentLibrary"))
            {
                Write-Debug "Downloading list. Item Count: $($itemCollection.Count) and BaseType: $($list.BaseType) and is in black list: $($blackList.Contains($list.Title))"
                $path = $rootPath + "\" + $list.RootFolder.Name

                if((Test-Path $path) -ne $true) {New-Item $path -ItemType directory}

                $xmlList = $parentElement.OwnerDocument.CreateElement("list")
                $xmlList.SetAttribute("title", $list.Title)
                $xmlList.SetAttribute("urlTitle", $list.RootFolder.Name)
                $parentElement.AppendChild($xmlList)
            
                Save-SPItemsToXml -itemCollection $itemCollection

            }
            else
            {
                Write-Debug "Not downloading list. Item Count: $($list.Items.Count) and BaseType: $($list.BaseType) and is in black list: $($blackList.Contains($list.Title))"
            }

        }
    }


}

function Save-SPItemsToXml
{
Param(
    [Microsoft.SharePoint.SPListCollection]$itemCollection
)

    $listItems = New-Object Xml

    foreach ($item in $itemCollection)
        {
            if($item.FileSystemObjectType -eq "Folder")
            {
                Save-SPItemsToXml $web.GetFolder($item)
            }
            else
            {
                $file = $item.file
                # Copy the file to the system drive
                $filePath = $path+"\"+$($file.Name)
                $fileBinary = $file.OpenBinary()
                $fileStream = New-Object System.IO.FileStream(($filePath), [System.IO.FileMode]::Create)
                $binaryWriter = New-Object System.IO.BinaryWriter($fileStream)
                $binaryWriter.Write($fileBinary)
                $binaryWriter.Close()

                # Update the XML
                $xmlFile = $xmlList.OwnerDocument.CreateElement("file")
                $xmlFile.SetAttribute("name", $file.Name)
                $xmlFile.SetAttribute("title", $file.Title)
                $xmlFile.SetAttribute("path", $filePath)

                if($($list.Title) -eq "Pages")
                {
                    $xmlFile.SetAttribute("layout", $file.Properties["PublishingPageLayout"])
                }

                $xmlList.AppendChild($xmlFile)
            }
        }
}

function New-SPLibrariesFromXml
{
Param
(
[Microsoft.SharePoint.SPWeb] $web,
[System.Xml.XMLElement]$parentElement
)

<#
 These two libraries are not available by default
 so these commands "ensure" they are available before 
 we try to add items to them.
#>
$web.Lists.EnsureSiteAssetsLibrary()
$web.Lists.EnsureSitePagesLibrary()

foreach($xmlList in $parentElement.list)
{
    $folder = $web.GetFolder($xmlList.urlTitle)
    $list = $web.Lists[$xmlList.title]

    $query = New-Object Microsoft.SharePoint.SPQuery

    $query.Folder = $folder

    $itemCollection = $list.GetItems($query)

    foreach($xmlFile in $xmlList.file)
    {
        
        foreach($item in $itemCollection)
        {
            if($item.Name -eq $xmlFile.name)
            {
                $item.File.CheckOut()
            }
        }

        $file = Get-ChildItem $xmlFile.path
        $newFile = $folder.Files.Add($xmlList.urlTitle +"/"+ $xmlFile.name, $file.OpenRead(), $true) 

        if($xmlList.title -eq "Pages")
        {
            $newFile.Properties["PublishingPageLayout"] = "$($web.Site.url)/_catalogs/masterpage/ArticleLeft.aspx, ArticleLeft"
            
            $newFile.Update()
        }

        try
        {
            if($newFile.CheckOutType -ne "None")
            {
                $newFile.CheckIn("Automatically checked in during migration",[Microsoft.SharePoint.SPCheckinType]::MajorCheckIn)
            
            }
        }catch
        {
            Write-Debug "File: $newFile does not need to be checked in."
        }

        #Publishing the item
        if( $list.EnableVersioning -and $list.EnableMinorVersions) 
        {   
            $newFile.Publish("Published automatically during migration")  
        }  

        #Approving it in case approval is required
        if($list.EnableModeration)
        {
            $newFile.Approve("Approved automatically during migration")
        }
    }

}



}

function Sync-SPBrandingFiles
{
    Param(
    [string]$inputDirectory,
    [Microsoft.SharePoint.SPSite]$site
    )

    $web = $site.OpenWeb()

    $masterPageGallery = $web.GetFolder("_catalogs/masterpage/")
    $templatesFolder = $web.GetFolder("_catalogs/masterpage/Display Templates/Content Web Parts")
    $StyleLibrary = $web.GetFolder("Style Library/XSL Style Sheets")


    try
    {
        $masterpages = Get-ChildItem "$inputDirectory\masterpage\*.master"
        $layouts = Get-ChildItem "$inputDirectory\layouts\*.html"
        $templates = Get-ChildItem "$inputDirectory\templates\*.html"
        $xslSheets = Get-ChildItem "$inputDirectory\xsl\*.xsl"
    }catch
    {
        Write-Host "Error: $_" -ForegroundColor Red
    }


    foreach($file in $masterpages)
    {
        try
        {

            $masterpage = $masterPageGallery.Files.Add($file.Name, $file.OpenRead(), $true)
            $layout.Update()
            $masterpage.Publish("Published during migration")
            $masterpage.Update()
        }
        catch
        {
            Write-Host "Error : $_" -foregroundcolor Red
        }
    }

    foreach($file in $layouts)
    {
        try
        {
            $layout = $masterPageGallery.Files.Add($file.Name, $file.OpenRead())
            $layout.Update()
            $layout.Publish("Published during migration")
            $layout.Update()
        }
        catch
        {
            Write-Host "Error : $_" -foregroundcolor Red
        }
    }

    foreach($file in $templates)
    {
        try
        {
            $template = $templatesFolder.Files.Add($file.Name, $file.OpenRead())
            $layout.Update()
            $template.Publish("Published during migration")
            $template.Update()
        }
        catch
        {
            Write-Host "Error : $_" -foregroundcolor Red
        }
    }

    foreach($file in $xslSheets)
    {
        try
        {
            $xslSheet = $StyleLibrary.Files.Add($file.Name, $file.OpenRead())
            $layout.Update()
            $xmlSheet.Publish("Published during migration")
            $xslSheet.Update()
        }
        catch
        {
            Write-Host "Error : $_" -foregroundcolor Red
        }
    }

}