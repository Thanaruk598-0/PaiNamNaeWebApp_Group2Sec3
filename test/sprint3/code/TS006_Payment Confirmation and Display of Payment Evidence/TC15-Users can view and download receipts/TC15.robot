*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup       Setup Browser
Suite Teardown    Close Browser

*** Variables ***
${URL}            http://localhost:3001/login
${MYTRIP_URL}     http://localhost:3001/myTrip
${BROWSER}        chrome
${USERNAME}       Passenger
${PASSWORD}       t1234567


*** Test Cases ***
TC14 Passenger View And Download Tax Invoice
    Login As Passenger

    Open My Trip Page

    Open Completed Tab

    Open Payment Documents
    Capture Page Screenshot    01_popup.png

    View Tax Invoice First

    Verify PDF Opened
    Capture Page Screenshot    02_pdf.png

    Return To Main Page

    Reopen Documents
    Download Tax Invoice


    Verify Download Success
    Capture Page Screenshot    03_final.png


*** Keywords ***

Setup Browser
    ${options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys

    ${prefs}=    Create Dictionary
    ...    download.prompt_for_download=False
    ...    download.directory_upgrade=True
    ...    plugins.always_open_pdf_externally=True

    Call Method    ${options}    add_experimental_option    prefs    ${prefs}
    Call Method    ${options}    add_argument    --start-maximized

    Open Browser    ${URL}    ${BROWSER}    options=${options}
    Set Selenium Speed    0.5s


Login As Passenger
    Wait Until Element Is Visible    id=identifier    15s
    Input Text    id=identifier    ${USERNAME}
    Input Text    xpath=//input[@type="password"]    ${PASSWORD}
    Click Element    xpath=//button[@type="submit"]
    Wait Until Page Does Not Contain Element    id=identifier    15s


Open My Trip Page
    Go To    ${MYTRIP_URL}
    Wait Until Page Contains    การเดินทางของฉัน    15s


Open Completed Tab
    Click Element    xpath=//button[contains(.,'ยืนยันแล้ว')]
    Wait Until Page Contains Element    xpath=//div    10s


Open Payment Documents
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)

    Execute JavaScript
    ...    let btns = Array.from(document.querySelectorAll("button"));
    ...    let target = btns.find(b => b.innerText.includes("เอกสาร"));
    ...    if(target){ target.click(); }

    Wait Until Page Contains    เอกสารการชำระเงิน    10s



View Tax Invoice First
    Click Element    xpath=(//button[@title="ดูเอกสาร"])[1]


Verify PDF Opened
    Sleep    2s
    ${handles}=    Get Window Handles
    Set Test Variable    ${handles}
    Length Should Be    ${handles}    2
    Switch Window    ${handles}[1]
    Location Should Contain    blob


Return To Main Page
    Close Window
    Switch Window    ${handles}[0]
    Wait Until Page Contains    การเดินทางของฉัน    10s


Reopen Documents
    Execute JavaScript    window.scrollTo(0, document.body.scrollHeight)

    Execute JavaScript
    ...    let btns = Array.from(document.querySelectorAll("button"));
    ...    let target = btns.find(b => b.innerText.includes("เอกสาร"));
    ...    if(target){ target.click(); }

    Wait Until Page Contains    เอกสารการชำระเงิน    10s


Download Tax Invoice
    Click Element    xpath=(//button[@title="ดาวน์โหลด"])[1]


Verify Download Success
    Sleep    2s
    Element Should Be Visible
    ...    xpath=//div[contains(.,'ใบสำคัญรับเงิน')]//button[@title="ดาวน์โหลด"]
    Page Should Contain    ใบสำคัญรับเงิน